export const CONSENT_KEY = 'vp_consent_v1'

/** Inline in <head>, before GTM: default everything to denied (or the stored choice). */
export const CONSENT_DEFAULT_SCRIPT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}var c='denied';try{if(localStorage.getItem('${CONSENT_KEY}')==='granted')c='granted'}catch(e){}gtag('consent','default',{analytics_storage:c,ad_storage:c,ad_user_data:c,ad_personalization:c,wait_for_update:500});`
