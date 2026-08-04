import { HttpException, HttpStatus, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { AdminLexiconEnrichRequest, FragmentType } from '@remember/contracts';
import { readLexiconConfig } from '../../config/read-lexicon-config.js';
import { AdminLexiconRepository } from './admin-lexicon.repository.js';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

interface DraftFragment {
  fragmentType: FragmentType;
  content: Record<string, unknown>;
  sortOrder: number;
  source: 'llm';
}

@Injectable()
export class AdminLexiconEnrichService {
  private activeCount = 0;
  private readonly config = readLexiconConfig();

  constructor(private readonly repository: AdminLexiconRepository) {}

  async enrich(input: AdminLexiconEnrichRequest): Promise<DraftFragment[]> {
    if (this.activeCount >= this.config.enrichMaxConcurrent) {
      throw new HttpException(
        { code: 'LEXICON_ENRICH_RATE_LIMITED', message: 'AI 补全请求过多，请稍后再试' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.activeCount += 1;
    try {
      if (this.config.enrichTestDelayMs > 0) {
        await sleep(this.config.enrichTestDelayMs);
      }

      const lemma = await this.repository.findLemmaByKey(input.lemmaKey);
      const headword = lemma?.headword ?? input.lemmaKey;

      if (!this.config.enrichMockEnabled && this.config.enrichApiUrl) {
        return await this.enrichViaHttp(input, headword);
      }

      return input.fragmentTypes.map((fragmentType, index) =>
        this.buildMockFragment(fragmentType, headword, index, input.context),
      );
    } finally {
      this.activeCount -= 1;
    }
  }

  private buildMockFragment(
    fragmentType: FragmentType,
    headword: string,
    sortOrder: number,
    context?: string,
  ): DraftFragment {
    const noteSuffix = context ? `（${context.slice(0, 32)}）` : '';

    switch (fragmentType) {
      case 'definition_zh':
        return {
          fragmentType,
          sortOrder,
          source: 'llm',
          content: { text: `${headword} 的中文释义${noteSuffix}`, pos: 'n.' },
        };
      case 'definition_en':
        return {
          fragmentType,
          sortOrder,
          source: 'llm',
          content: { text: `English definition for ${headword}` },
        };
      case 'example':
        return {
          fragmentType,
          sortOrder,
          source: 'llm',
          content: {
            en: `This is an example with ${headword}.`,
            zh: `这是一个包含 ${headword} 的例句。`,
          },
        };
      case 'mnemonic':
        return {
          fragmentType,
          sortOrder,
          source: 'llm',
          content: { text: `联想记忆：${headword}` },
        };
      case 'morphology':
        return {
          fragmentType,
          sortOrder,
          source: 'llm',
          content: { breakdown: `${headword} 词形说明` },
        };
      case 'note':
        return {
          fragmentType,
          sortOrder,
          source: 'llm',
          content: { text: `运营备注：${headword}${noteSuffix}` },
        };
      default:
        return {
          fragmentType,
          sortOrder,
          source: 'llm',
          content: { text: headword },
        };
    }
  }

  private async enrichViaHttp(
    input: AdminLexiconEnrichRequest,
    headword: string,
  ): Promise<DraftFragment[]> {
    const url = this.config.enrichApiUrl;
    if (!url) {
      throw new ServiceUnavailableException({
        code: 'LEXICON_ENRICH_UNAVAILABLE',
        message: 'AI 补全服务未配置',
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.config.enrichApiKey) {
      headers.Authorization = `Bearer ${this.config.enrichApiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        lemmaKey: input.lemmaKey,
        headword,
        fragmentTypes: input.fragmentTypes,
        context: input.context ?? null,
      }),
    });

    if (!response.ok) {
      throw new ServiceUnavailableException({
        code: 'LEXICON_ENRICH_FAILED',
        message: 'AI 补全服务暂时不可用',
      });
    }

    const payload = (await response.json()) as {
      draftFragments?: DraftFragment[];
    };
    if (!Array.isArray(payload.draftFragments)) {
      throw new ServiceUnavailableException({
        code: 'LEXICON_ENRICH_INVALID_RESPONSE',
        message: 'AI 补全服务返回格式错误',
      });
    }

    return payload.draftFragments.map((fragment) => ({
      fragmentType: fragment.fragmentType,
      sortOrder: fragment.sortOrder,
      source: 'llm' as const,
      content: fragment.content,
    }));
  }
}
