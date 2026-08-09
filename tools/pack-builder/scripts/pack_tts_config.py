"""Shared edge-tts voice for pack-builder content production."""

# 固定音色：英式女声 Libby（Microsoft Edge TTS / en-GB）
# 与人教版 PEP 附录英式 IPA 一致；后续 vocabulary 包 TTS 脚本应 import 此常量。
PACK_TTS_VOICE = 'en-GB-LibbyNeural'
PACK_TTS_DIALECT = 'uk'

# 展示形 headword 不能直接送 TTS 时，按顺序分段合成再拼接（如 a/an → a + an）。
HEADWORD_TTS_SEGMENTS: dict[str, list[str]] = {
    'a/an': ['a', 'an'],
}
