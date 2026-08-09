#!/usr/bin/env python3
"""CLI for PEP grade 4–6 vocabulary pack production."""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

from pep_vocab_common import PACK_CONFIGS, PackConfig, generate_pack_source, parse_vocab
from scan_example_tokens import scan_cards, scan_examples_module

ROOT = Path(__file__).resolve().parents[3]
SOURCE_ROOT = ROOT / 'tools/pack-builder/source'


HAND_EXAMPLES_MODULES: dict[str, str] = {
    'en-grade3-v1-rj': 'grade3_vol1_examples_data',
    'en-grade3-v1-mj': 'grade3_vol1_mj_examples_data',
    'en-grade3-v2-mj': 'grade3_vol2_mj_examples_data',
    'en-grade3-v2-rj': 'grade3_vol2_examples_data',
    'en-grade4-v1-mj': 'grade4_vol1_mj_examples_data',
    'en-grade4-v1-rj': 'grade4_vol1_examples_data',
    'en-grade4-v2-mj': 'grade4_vol2_mj_examples_data',
    'en-grade4-v2-rj': 'grade4_vol2_examples_data',
    'en-grade5-v1-rj': 'grade5_vol1_examples_data',
    'en-grade5-v1-mj': 'grade5_vol1_mj_examples_data',
    'en-grade5-v2-mj': 'grade5_vol2_mj_examples_data',
    'en-grade5-v2-rj': 'grade5_vol2_examples_data',
    'en-grade6-v1-rj': 'grade6_vol1_examples_data',
    'en-grade6-v1-mj': 'grade6_vol1_mj_examples_data',
    'en-grade6-v2-mj': 'grade6_vol2_mj_examples_data',
    'en-grade6-v2-rj': 'grade6_vol2_examples_data',
}

HAND_MNEMONICS_MODULES: dict[str, str] = {
    'en-grade3-v1-rj': 'grade3_vol1_mnemonics',
    'en-grade3-v1-mj': 'grade3_vol1_mj_mnemonics',
    'en-grade3-v2-mj': 'grade3_vol2_mj_mnemonics',
    'en-grade3-v2-rj': 'grade3_vol2_mnemonics',
    'en-grade4-v1-mj': 'grade4_vol1_mj_mnemonics',
    'en-grade4-v1-rj': 'grade4_vol1_mnemonics',
    'en-grade4-v2-mj': 'grade4_vol2_mj_mnemonics',
    'en-grade4-v2-rj': 'grade4_vol2_mnemonics',
    'en-grade5-v1-rj': 'grade5_vol1_mnemonics',
    'en-grade5-v1-mj': 'grade5_vol1_mj_mnemonics',
    'en-grade5-v2-mj': 'grade5_vol2_mj_mnemonics',
    'en-grade5-v2-rj': 'grade5_vol2_mnemonics',
    'en-grade6-v1-rj': 'grade6_vol1_mnemonics',
    'en-grade6-v1-mj': 'grade6_vol1_mj_mnemonics',
    'en-grade6-v2-mj': 'grade6_vol2_mj_mnemonics',
    'en-grade6-v2-rj': 'grade6_vol2_mnemonics',
}

VOCAB_FIXES_MODULES: dict[str, str] = {
    'en-grade3-v1-rj': 'grade3_vol1_vocab_fixes',
    'en-grade3-v1-mj': 'grade3_vol1_mj_vocab_fixes',
    'en-grade3-v2-mj': 'grade3_vol2_mj_vocab_fixes',
    'en-grade3-v2-rj': 'grade3_vol2_vocab_fixes',
    'en-grade4-v1-mj': 'grade4_vol1_mj_vocab_fixes',
    'en-grade4-v2-mj': 'grade4_vol2_mj_vocab_fixes',
    'en-grade6-v1-rj': 'grade6_vol1_vocab_fixes',
    'en-grade6-v1-mj': 'grade6_vol1_mj_vocab_fixes',
    'en-grade6-v2-mj': 'grade6_vol2_mj_vocab_fixes',
    'en-grade6-v2-rj': 'grade6_vol2_vocab_fixes',
    'en-grade4-v1-rj': 'grade4_vol1_vocab_fixes',
    'en-grade4-v2-rj': 'grade4_vol2_vocab_fixes',
    'en-grade5-v1-mj': 'grade5_vol1_mj_vocab_fixes',
    'en-grade5-v2-mj': 'grade5_vol2_mj_vocab_fixes',
    'en-grade5-v2-rj': 'grade5_vol2_vocab_fixes',
}


def load_module(stem: str):
    module_path = SCRIPT_DIR / f'{stem}.py'
    if not module_path.exists():
        return None
    import importlib.util

    spec = importlib.util.spec_from_file_location(stem, module_path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def load_examples_module(pack_id: str):
    module_stem = HAND_EXAMPLES_MODULES.get(pack_id, pack_id.replace('-', '_') + '_examples')
    module = load_module(module_stem)
    if module is None:
        return {}
    return {k.lower(): v for k, v in getattr(module, 'EXAMPLES', {}).items()}


def load_mnemonics_module(pack_id: str):
    module_stem = HAND_MNEMONICS_MODULES.get(pack_id)
    if not module_stem:
        return None, None, None, None, None
    module = load_module(module_stem)
    if module is None:
        return None, None, None, None, None
    return getattr(module, 'mnemonic_for', None), getattr(module, 'INFLECTION_NOTES', None), (
        {k.lower(): v for k, v in getattr(module, 'DEFINITION_OVERRIDES', {}).items()}
        if getattr(module, 'DEFINITION_OVERRIDES', None)
        else None
    ), (
        {k.lower(): v for k, v in getattr(module, 'POS_OVERRIDES', {}).items()}
        if getattr(module, 'POS_OVERRIDES', None)
        else None
    ), (
        {k.lower(): v for k, v in getattr(module, 'IPA_OVERRIDES', {}).items()}
        if getattr(module, 'IPA_OVERRIDES', None)
        else None
    )


def load_vocab_fixes_fn(pack_id: str):
    module_stem = VOCAB_FIXES_MODULES.get(pack_id)
    if not module_stem:
        return None
    module = load_module(module_stem)
    if module is None:
        return None
    return getattr(module, 'apply_vocab_fixes', None)


def examples_module_stem(pack_id: str) -> str | None:
    stem = HAND_EXAMPLES_MODULES.get(pack_id, pack_id.replace('-', '_') + '_examples')
    if not (SCRIPT_DIR / f'{stem}.py').exists():
        return None
    return stem


def source_meta_path(config: PackConfig) -> Path:
    return SOURCE_ROOT / config.pack_id / 'meta.json'


def assert_pack_version_matches_config(config: PackConfig) -> None:
    meta_path = source_meta_path(config)
    if not meta_path.exists():
        raise SystemExit(
            f'pack version check failed: missing {meta_path}\n'
            f'Run: python tools/pack-builder/scripts/pep_vocab_pipeline.py {config.pack_id} generate',
        )

    meta = json.loads(meta_path.read_text(encoding='utf-8'))
    meta_version = meta.get('packVersion')
    if meta_version != config.pack_version:
        raise SystemExit(
            f'pack version mismatch for {config.pack_id}:\n'
            f'  pep_vocab_common.py pack_version = {config.pack_version!r}\n'
            f'  source/meta.json packVersion      = {meta_version!r}\n'
            f'Bump pack_version in pep_vocab_common.py, then run generate before build.',
        )


def report_example_token_failures(label: str, failures: list[tuple[str, str]], source_hint: str) -> None:
    print(f'example token check failed ({label}): {len(failures)} violation(s)', file=sys.stderr)
    for headword, sentence in failures[:20]:
        print(f'  {headword!r} -> {sentence!r}', file=sys.stderr)
    if len(failures) > 20:
        print(f'  ... and {len(failures) - 20} more', file=sys.stderr)
    raise SystemExit(
        f'Fix examples in {source_hint}.\n'
        'Each English sentence must contain the headword as an exact token (same rule as Admin verify).\n'
        'Do not change plural→singular (or similar) just to pass — rewrite so the headword appears '
        'naturally and the sentence stays grammatically correct.',
    )


def assert_examples_source_valid(pack_id: str) -> None:
    """Validate EXAMPLES in *_examples_data.py before generate."""
    stem = examples_module_stem(pack_id)
    if stem is None:
        print(f'example token check skipped: no examples module for {pack_id}')
        return

    failures = scan_examples_module(stem)
    if failures:
        report_example_token_failures(stem, failures, f'tools/pack-builder/scripts/{stem}.py')
    print(f'example token check passed ({stem}.py)')


def assert_example_tokens_valid(pack_id: str) -> None:
    """Validate cards.json examples before build (catches stale source after manual edits)."""
    cards_path = SOURCE_ROOT / pack_id / 'cards.json'
    if not cards_path.exists():
        raise SystemExit(
            f'example token check failed: missing {cards_path}\n'
            f'Run: python tools/pack-builder/scripts/pep_vocab_pipeline.py {pack_id} generate',
        )

    failures = scan_cards(pack_id)
    if failures:
        stem = examples_module_stem(pack_id)
        source_hint = (
            f'tools/pack-builder/scripts/{stem}.py, then re-run generate'
            if stem
            else f'source/{pack_id}/cards.json'
        )
        report_example_token_failures(pack_id, failures, source_hint)
    print(f'example token check passed ({pack_id} cards.json)')


def cmd_parse(config: PackConfig) -> None:
    rows = parse_vocab(config)
    print(f'parsed {len(rows)} entries -> cache/{config.cache_name}')


def cmd_generate(config: PackConfig) -> None:
    assert_examples_source_valid(config.pack_id)
    examples = load_examples_module(config.pack_id)
    mnemonic_for_fn, inflection_notes, definition_overrides, pos_overrides, ipa_overrides = load_mnemonics_module(
        config.pack_id
    )
    from pep_vocab_common import mnemonic_for as default_mnemonic_for

    output = generate_pack_source(
        config,
        examples,
        mnemonic_for_fn=mnemonic_for_fn or default_mnemonic_for,
        inflection_notes=inflection_notes,
        definition_overrides=definition_overrides,
        pos_overrides=pos_overrides,
        ipa_overrides=ipa_overrides,
        vocab_fixes_fn=load_vocab_fixes_fn(config.pack_id),
    )
    stats = json.loads((output / 'content-stats.json').read_text(encoding='utf-8'))
    print(f'generated {stats["cardCount"]} cards at {output}')


def cmd_check_examples(config: PackConfig) -> None:
    assert_examples_source_valid(config.pack_id)


def cmd_build(config: PackConfig) -> None:
    assert_pack_version_matches_config(config)
    assert_example_tokens_valid(config.pack_id)
    zip_path = ROOT / 'tools/pack-builder/output' / f'{config.pack_id}-{config.pack_version}.zip'
    cli = ROOT / 'tools/pack-builder/dist/cli.js'
    subprocess.check_call(
        ['node', str(cli), 'build', '--source', f'tools/pack-builder/source/{config.pack_id}', '--output', str(zip_path)],
        cwd=ROOT,
    )
    subprocess.check_call(['node', str(cli), 'verify', '--', str(zip_path)], cwd=ROOT)
    print(f'verified {zip_path}')


def main() -> None:
    parser = argparse.ArgumentParser(description='PEP vocabulary pack pipeline')
    parser.add_argument('pack_id', choices=sorted(PACK_CONFIGS))
    parser.add_argument('action', choices=['parse', 'generate', 'build', 'all', 'check-examples'])
    args = parser.parse_args()
    config = PACK_CONFIGS[args.pack_id]
    if args.action in {'parse', 'all'}:
        cmd_parse(config)
    if args.action == 'check-examples':
        cmd_check_examples(config)
    if args.action in {'generate', 'all'}:
        cmd_generate(config)
    if args.action == 'build':
        cmd_build(config)
    if args.action == 'all':
        audio_script = SCRIPT_DIR / 'generate_pep_vocab_audio.py'
        subprocess.check_call([sys.executable, str(audio_script), config.pack_id], cwd=ROOT)
        cmd_build(config)


if __name__ == '__main__':
    main()
