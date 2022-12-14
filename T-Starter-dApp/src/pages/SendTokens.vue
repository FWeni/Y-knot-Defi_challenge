<template>
  <q-page>
    <section class="header-bg" />
    <section
      class="body-container"
      style="max-width: 580px"
      v-if="!isAuthenticated"
    >
      <q-card class="not-authenticated">
        <div class="text-subtitle1">Please login</div>
      </q-card>
    </section>
    <section class="body-container" style="max-width: 580px" v-else>
      <q-card class="authenticated q-mb-lg">

        <q-btn
          :to="{ name: 'wallet', params: { accountName: accountName } }"
          flat
          round
          class="self-start"
        >
          <q-icon
            class="hover-accent"
            name="fas fa-chevron-circle-left"
            style="font-size: 50px"
          />
        </q-btn>
        <div class="row items-center justify-center q-pa-sm q-pb-md">
          <h2>Send</h2>
          <div class="row items-center justify-center">
            <token-avatar
              :token="avatar ? avatar : selectedTokenSym"
              :avatarSize="55"
            />
            <h2>
              {{ selectedTokenSym }}
            </h2>
          </div>
        </div>
        <div />
        <div />
      <div>
        <div class="networks row justify-center q-pb-sm">
          <div class="text-weight-light text-subtitle2  col-12 text-center">
            {{ currentChain.NETWORK_NAME }} Balance
          </div>
          <div>{{ balance }} {{ selectedTokenSym }}</div>
        </div>
          <teleport
            v-if="supportedEvmChains.includes(selectedNetwork)"
            :selectedTokenSym="selectedTokenSym"
            :selectedNetwork.sync="selectedNetwork"
            :networkOptions="networkOptions"
            :supportedEvmChains="supportedEvmChains"
          />
          <send-eos-chains
            v-else
            :selectedTokenSym="selectedTokenSym"
            :selectedNetwork.sync="selectedNetwork"
            :networkOptions="networkOptions"
          />
      </div>
      </q-card>
      <teleport-dash
        v-if="getTeleports.length > 0 && tportTokens.includes(selectedTokenSym)"
        :selectedTokenSym="selectedTokenSym"
      />
    </section>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";
import teleport from "src/components/send/SendTeleport";
import teleportDash from "src/components/send/TeleportDash";
import sendEosChains from "src/components/send/SendEosChains";
import metamask from "src/components/Metamask";

export default {
  components: {
    tokenAvatar,
    teleport,
    teleportDash,
    sendEosChains
  },
  mixins: [metamask],
  data() {
    return {
      selectedTokenSym: "START",
      selectedNetwork: "ETHEREUM"
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("tport", [
      "getEvmNetworkList",
      "getTPortTokensBySym",
      "getTPortTokens",
      "getTeleports"
    ]),
    ...mapGetters("blockchains", [
      "currentChain",
      "getNetworkByName",
      "getBridgeTokens"
    ]),

    selectedToken() {
      return this.wallet.find(a => a.token_sym === this.selectedTokenSym);
    },

    avatar() {
      return this.selectedToken ? this.selectedToken.avatar : "";
    },

    balance() {
      return this.selectedToken ? this.selectedToken.balance : 0;
    },

    supportedEosChains() {
      const bridgeTokens = this.getBridgeTokens;
      if (bridgeTokens && this.selectedToken !== undefined) {
        // console.log({ bridgeTokens });
        let res = [this.currentChain.NETWORK_NAME];
        for (let token of bridgeTokens) {
          if (
            this.$getSymFromAsset(token.token_info) === this.selectedTokenSym
          ) {
            res.push(token.channel.toUpperCase());
          }
        }
        return res;
      } else return [];
    },

    supportedEvmChains() {
      const token = this.getTPortTokensBySym(this.selectedTokenSym);
      if (token) {
        // console.log({ token });
        let res = [];
        for (let r of token.remote_contracts) {
          const network = this.getEvmNetworkList.find(
            el => el.remoteId === r.key
          );
          if (network) res.push(network.name.toUpperCase());
        }
        return res;
      } else return [];
    },

    networkOptions() {
      return [...this.supportedEosChains, ...this.supportedEvmChains];
    },

    tportTokens() {
      // let tportTokens = [];
      // if (this.getTPortTokens.length > 0) {
      //   tportTokens = this.getTPortTokens.map(el => el.token.sym);
      // }
      // return tportTokens
      if (this.getTPortTokens.length === 0) return [];
      else return this.getTPortTokens.map(el => el.token.sym);
    }
  },
  methods: {
    ...mapActions("account", ["reloadWallet", "setWalletBalances"]),
    ...mapActions("blockchains", ["setBridgeTokens"]),
    ...mapActions("tport", ["setTPortTokens"])
  },
  mounted() {
    if (this.$route.query.token_sym !== undefined)
      this.selectedTokenSym = this.$route.query.token_sym;
    this.selectedNetwork = this.currentChain.NETWORK_NAME;
    this.setBridgeTokens();
    this.reloadWallet(this.accountName);
    this.setTPortTokens();
    this.$store.dispatch("tport/setTeleports", this.accountName);
  },

  watch: {
    async accountName() {
      this.reloadWallet(this.accountName);
      this.$store.dispatch("tport/setTeleports", this.accountName);
    },
    async selectedNetwork() {
      if (this.supportedEvmChains.includes(this.selectedNetwork)) {
        this.connectWeb3();
        this.switchMetamaskNetwork(this.selectedNetwork);
      }
    },
  }
};
</script>

<style lang="scss" scoped>
.q-card {
  &.not-authenticated {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    min-height: 100px;
  }
  &.authenticated {
    display: grid;
    align-items: stretch;
    grid-template-columns: 50px auto 50px;
    padding-bottom: 40px;
    & div {
      margin: 0;
      @media only screen and (max-width: 585px) {
        grid-column-start: 1;
        grid-column-end: 4;
      }
    }
  }
}
.header-bg {
  height: 160px;
  margin-bottom: -50px;
}
h2 {
  line-height: 45px;
  margin: 0 10px;
  font-size: 35px;
}
</style>
