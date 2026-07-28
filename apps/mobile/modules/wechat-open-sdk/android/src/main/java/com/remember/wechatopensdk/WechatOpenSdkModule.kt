package com.remember.wechatopensdk

import com.tencent.mm.opensdk.openapi.IWXAPI
import com.tencent.mm.opensdk.openapi.WXAPIFactory
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WechatOpenSdkModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WechatOpenSdk")

    AsyncFunction("assertCoreClassesLoaded") {
      Class.forName("com.tencent.mm.opensdk.openapi.WXAPIFactory")
      Class.forName("com.tencent.mm.opensdk.openapi.IWXAPI")
      WXAPIFactory::class.java.name
      IWXAPI::class.java.name
    }
  }
}
