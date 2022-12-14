import { UAL } from "universal-authenticator-library";
import { KeycatAuthenticator } from "@telosnetwork/ual-telos-keycat";
import { Scatter } from "ual-scatter";
import { Wombat } from "ual-wombat";
import { Sqrl } from "@smontero/ual-sqrl";
import { Anchor } from "ual-anchor";
import { Wax } from "@eosdacio/ual-wax";

export default async ({ Vue, store }) => {
  // set and get blockchain
  if (localStorage.getItem("selectedChain") != null) {
    await store.dispatch(
      "blockchains/setNewChain",
      localStorage.getItem("selectedChain")
    );
  } else {
    await store.dispatch("blockchains/setNewChain", "TELOS");
  }
  let currentChain = store.getters["blockchains/currentChain"];
  // console.log(currentChain)

  const chain = {
    chainId: currentChain.NETWORK_CHAIN_ID,
    rpcEndpoints: [
      {
        protocol: currentChain.NETWORK_PROTOCOL,
        host: currentChain.NETWORK_HOST,
        port: currentChain.NETWORK_PORT,
      },
    ],
  };

  let authenticators = [];

  // if telos network, include 'telos sign' as login option
  // if (currentChain.NETWORK_NAME === 'TELOS') {
  //   authenticators = authenticators.concat([new KeycatAuthenticator([chain], { appName: process.env.APP_NAME })])
  // }

  // if wax network, include 'wax cloud wallet' as login option
  if (currentChain.NETWORK_NAME === "WAX") {
    authenticators = authenticators.concat([
      new Wax([chain], { appName: process.env.APP_NAME }),
    ]);
  }

  authenticators = authenticators.concat([
    new Sqrl([chain], { appName: process.env.APP_NAME }),
    new Anchor([chain], { appName: process.env.APP_NAME }),
    new Wombat([chain], { appName: process.env.APP_NAME }),
    new Scatter([chain], { appName: process.env.APP_NAME }),
  ]);

  const ual = new UAL([chain], "ual", authenticators);
  store["$ual"] = ual;
  Vue.prototype.$ual = ual;
};
