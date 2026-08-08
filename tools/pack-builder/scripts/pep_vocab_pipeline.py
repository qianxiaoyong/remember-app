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

ROOT = Path(__file__).resolve().parents[3]


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


def cmd_parse(config: PackConfig) -> None:
    rows = parse_vocab(config)
    print(f'parsed {len(rows)} entries -> cache/{config.cache_name}')


def cmd_generate(config: PackConfig) -> None:
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


def cmd_build(config: PackConfig) -> None:
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
    parser.add_argument('action', choices=['parse', 'generate', 'build', 'all'])
    args = parser.parse_args()
    config = PACK_CONFIGS[args.pack_id]
    if args.action in {'parse', 'all'}:
        cmd_parse(config)
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
