/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 *
 * You are probably looking on adding startup/initialization code.
 * Use "quasar new boot <name>" and add it there.
 * One boot file per concern. Then reference the file(s) in quasar.conf.js > boot:
 * boot: ['file', ...] // do not add ".js" extension to it.
 *
 * Boot files are your "main.js"
 **/



import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'

import '@quasar/extras/roboto-font/roboto-font.css'

import '@quasar/extras/material-icons/material-icons.css'




// We load Quasar stylesheet file
import 'quasar/dist/quasar.sass'




import 'src/css/app.scss'


import Vue from 'vue'
import createApp from './app.js'




import qboot_Bootual from 'boot/ual'

import qboot_Boothyperion from 'boot/hyperion'

import qboot_Bootapi from 'boot/api'

import qboot_Bootpoolinfo from 'boot/poolinfo'

import qboot_Bootballotinfo from 'boot/ballotinfo'

import qboot_Boothelpers from 'boot/helpers'

import qboot_Bootmoonpay from 'boot/moonpay'

import qboot_Boottport from 'boot/tport'

import qboot_Bootweb3 from 'boot/web3'

import qboot_Booterc20 from 'boot/erc20'

import qboot_Bootvault from 'boot/vault'

import qboot_Bootnewrelic from 'boot/newrelic'







Vue.config.devtools = true
Vue.config.productionTip = false



console.info('[Quasar] Running SPA.')





const publicPath = `/`


async function start () {
  const { app, store, router } = await createApp()

  

  
  let hasRedirected = false
  const redirect = url => {
    hasRedirected = true
    const normalized = Object(url) === url
      ? router.resolve(url).route.fullPath
      : url

    window.location.href = normalized
  }

  const urlPath = window.location.href.replace(window.location.origin, '')
  const bootFiles = [qboot_Bootual,qboot_Boothyperion,qboot_Bootapi,qboot_Bootpoolinfo,qboot_Bootballotinfo,qboot_Boothelpers,qboot_Bootmoonpay,qboot_Boottport,qboot_Bootweb3,qboot_Booterc20,qboot_Bootvault,qboot_Bootnewrelic]

  for (let i = 0; hasRedirected === false && i < bootFiles.length; i++) {
    if (typeof bootFiles[i] !== 'function') {
      continue
    }

    try {
      await bootFiles[i]({
        app,
        router,
        store,
        Vue,
        ssrContext: null,
        redirect,
        urlPath,
        publicPath
      })
    }
    catch (err) {
      if (err && err.url) {
        window.location.href = err.url
        return
      }

      console.error('[Quasar] boot error:', err)
      return
    }
  }

  if (hasRedirected === true) {
    return
  }
  

  

    

    

    
      new Vue(app)
    

    

    

  

}

start()
