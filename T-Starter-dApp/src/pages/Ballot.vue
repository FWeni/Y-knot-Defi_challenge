<template>
  <q-page>
    <section class="header-bg" />
    <div class="body-container">
      <q-card class="row justify-between content-start q-mb-lg">
        <div class="join-pane col-xs-12 col-sm-7 ">
          <q-item>
            <q-item-section top class="col-shrink">
              <token-avatar :token="pool.avatar" :avatarSize="80" />
            </q-item-section>
            <q-item-section top class="q-pl-sm">
              <div class="row justify-between content-start items-start ">
                <div>
                  <div class="text-h3 q-pb-md q-pt-sm">{{ pool.title }}</div>
                  <p style="margin-bottom: 0">
                    Contract:
                    <a target="_blank" :href="contractURL">
                      {{ pool.swap_ratio.contract }}
                    </a>
                  </p>
                </div>
                <div class="row col-xs-10 col-sm-shrink">
                  <status-badge
                    :poolStatus="
                      ['loading', 'draft'].includes(pool.pool_status)
                        ? pool.pool_status
                        : 'voting'
                    "
                    style="margin-left: 0"
                  />
                </div>
              </div>
            </q-item-section>
          </q-item>
          <q-item>
            <p>
              {{ pool.tag_line }}
            </p>
          </q-item>
          <div
            v-if="['open', 'upcoming'].includes(pool.pool_status)"
            class="row content-start justify-start q-gutter-sm"
            style="padding: 8px 16px"
          >
            <div class="col" style="min-width: 260px">
              <div
                class="col row items-center"
                v-if="pool.pool_status === 'upcoming'"
              >
                <div class="q-mr-md">Voting ends in:</div>
                <status-countdown
                  :deadline="pool.ballot_close"
                  :poolID="poolID"
                  @countdown-finished="getPoolInfo"
                />
              </div>
              <div
                class="col row items-center"
                v-else-if="pool.pool_status === 'open'"
              >
                <div class="q-mr-md">Closes in:</div>
                <status-countdown
                  :deadline="pool.public_end"
                  :poolID="poolID"
                  @countdown-finished="getPoolInfo"
                />
              </div>
            </div>
            <!-- sentiment -->
            <!-- <div class="row q-gutter-x-sm text-h6">
              <q-btn
                outline
                flat
                padding="6px 8px"
                icon="fas fa-thumbs-up"
                class="hover-accent"
                size="1.05rem"
                :color="userSentiment === 'upvote' ? 'positive' : 'black'"
                @click="updateUserSentiment('upvote')"
                :disable="!isAuthenticated"
              />
              <div
                :class="
                  userSentiment === 'upvote' ? 'text-positive' : 'text-black'
                "
              >
                {{ sentimentValue("upvote") }}
              </div>
              <q-btn
                outline
                flat
                padding="6px 8px"
                size="1.05rem"
                icon="fas fa-thumbs-down"
                class="hover-accent"
                :color="userSentiment === 'downvote' ? 'accent' : 'black'"
                @click="updateUserSentiment('downvote')"
                :disable="!isAuthenticated"
              />
              <div
                :class="
                  userSentiment === 'downvote' ? 'text-negative' : 'text-black'
                "
              >
                {{ sentimentValue("downvote") }}
              </div>
            </div> -->
          </div>
          <q-item v-if="pool.owner === accountName">
            <q-btn
              v-if="pool.owner === accountName"
              label="Update"
              outline
              color="primary"
              :to="{ name: 'updateballot', params: { id: poolID } }"
              class="q-ml-sm"
            />
          </q-item>
        </div>
        <q-item class="token-info col column">
          <div class="border col column justify-between">
            <div class="row justify-between">
              <h6>Hard cap:</h6>
              <h5>{{ this.$chainStrReformat(pool.hard_cap, 2) }}</h5>
            </div>
            <div class="row justify-between">
              <h6>Soft cap:</h6>
              <h5>{{ this.$chainStrReformat(pool.soft_cap, 2) }}</h5>
            </div>
            <div class="row justify-between">
              <h6>Swap ratio:</h6>
              <h5>
                {{ swapRatio }}
              </h5>
            </div>
          </div>
          <!-- Voting progress -->
          <div class="row justify-center q-pt-sm">
            <upDownVote
              :ballot="pool"
              :ballotConfig="ballotConfig"
              :stakePool="stakePool"
              @voteSubmitted="getPoolInfo"
            />
          </div>
        </q-item>

        <q-inner-loading :showing="pool.title === 'Loading'">
          <q-spinner-puff size="50px" color="primary" />
        </q-inner-loading>
      </q-card>
      <q-card class="body-container">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab name="details" label="DETAILS" />
          <q-tab name="overview" label="OVERVIEW" />
        </q-tabs>

        <q-separator />

        <q-tab-panels
          v-model="tab"
          animated
          swipeable
          class="tab-panel-container"
        >
          <q-tab-panel name="details" @mousedown.stop>
            <tab-details :pool="pool" />
          </q-tab-panel>
          <q-tab-panel name="overview" @mousedown.stop>
            <tab-overview :pool="pool" />
          </q-tab-panel>
        </q-tab-panels>

        <q-inner-loading :showing="pool.title === 'Loading'">
          <q-spinner-puff size="50px" color="primary" />
        </q-inner-loading>
      </q-card>
    </div>

    <q-dialog v-model="insufficient_start_show">
      <q-card>
        <q-card-section>
          <div class="text-h6">Insufficient START</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          You don't have enough START to complete this action.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            class="hover-accent"
            flat
            label="Cancel"
            color="primary"
            v-close-popup
          />
          <q-btn
            flat
            class="hover-accent"
            label="Buy START"
            color="primary"
            v-close-popup
            type="a"
            target="_blank"
            :href="buyStartUrl"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import statusCountdown from "src/components/poolinfo/status-countdown";
import statusBadge from "src/components/poolinfo/status-badge";
import tabOverview from "src/components/poolinfo/tab-overview.vue";
import tabAllocations from "src/components/poolinfo/tab-allocations.vue";
import tabDetails from "src/components/poolinfo/tab-details.vue";
import tabComments from "src/components/poolinfo/tab-comments.vue";
import statusProgress from "src/components/poolinfo/status-progress";
import tokenAvatar from "src/components/TokenAvatar";
import { mapGetters, mapActions } from "vuex";
import { date } from "quasar";
import upDownVote from "src/components/ballots/UpDownVote";

export default {
  components: {
    tabOverview,
    tabDetails,
    statusCountdown,
    statusBadge,
    tokenAvatar,
    upDownVote
  },
  data() {
    return {
      tab: "details",
      poolID: Number(this.$route.params.id),
      pool: this.$defaultBallotInfo,
      polling: null,
      claimable: false,
      insufficient_start_show: false,
      buyStartUrl: process.env.BUY_START_URL,
      settings: {},
      ballotConfig: {},
      stakePool: 0
    };
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "wallet"]),
    ...mapGetters("blockchains", ["currentChain"]),
    ...mapGetters("ballots", [
      "getAllBallotIDs",
      "getBallotByID",
      "getBallotByIDChain",
      "getAllBallots",
      "getPublishedBallots",
      "getUpcomingBallots"
    ]),

    START_info() {
      return this.wallet.find(el => (el.sym = "START"));
    },

    progressToPercentage() {
      return (this.pool.progress * 100).toFixed(0) + "%";
    },

    isWhitelisted() {
      if (
        this.pool.whitelist.length > 0 &&
        this.pool.whitelist.includes(this.accountName)
      ) {
        return true;
      } else if (this.pool.whitelist.length === 0) {
        return true;
      } else {
        return false;
      }
    },

    contractURL() {
      let contractName = this.pool.swap_ratio.contract;
      if (contractName === "Loading" || contractName === "") return "#";
      else {
        try {
          return `${this.currentChain.NETWORK_EXPLORER}/account/${contractName}`;
        } catch (error) {
          return "Error";
        }
      }
    },
    swapRatio() {
      try {
        if (this.pool.swap_ratio.quantity === "Loading") return "Loading";
        else {
          let baseSym = this.pool.base_token.sym.split(",")[1];
          let [quantity, sym] = this.pool.swap_ratio.quantity.split(" ");
          if (baseSym && quantity && sym)
            return `1 ${baseSym} = ${parseFloat(quantity)} ${sym}`;
          else return "";
        }
      } catch (error) {
        return "Error";
      }
    },
    progressLabel() {
      if (this.pool.total_raise === "Loading") return "Loading";
      else {
        let totalRaise = this.$chainToQty(this.pool.total_raise);
        let hardCap = this.$chainToQty(this.pool.hard_cap, 0);
        return `${totalRaise} / ${hardCap}`;
      }
    }
    // userSentiment() {
    //   let result = "none";
    //   if (this.pool.sentiment_table) {
    //     let sentiment = this.pool.sentiment_table.find(
    //       el => el.account === this.accountName
    //     );
    //     if (sentiment) {
    //       if (sentiment.vote > 0) result = "upvote";
    //       if (sentiment.vote < 0) result = "downvote";
    //     }
    //   }
    //   return result;
    // }
  },
  methods: {
    ...mapActions("pools", [
      "getChainPoolByID",
      "getAllocationByPool",
      "getPlatformToken",
      "getBalanceFromChain",
      "getPoolsSettings",
      "updateSentimentByPoolID",
      "updateCommentsByPoolID"
    ]),
    ...mapActions("ballots", [
      "getAllChainBallots",
      "getChainBallotByID",
      "getBallotConfig"
    ]),
    ...mapActions("account", ["getChainSTART"]),
    getPoolInfo() {
      this.pool = this.getBallotByIDChain(
        this.poolID,
        this.currentChain.NETWORK_NAME
      );
    },
    hasAllocations(data) {
      return Object.keys(data).length > 0;
    },

    async getClaimStatus() {
      let payload = { account: this.accountName, poolID: this.pool.id };
      let allocation = await this.getAllocationByPool(payload);
      if (
        this.hasAllocations(allocation) &&
        (this.pool.pool_status === "completed" ||
          this.pool.pool_status === "filled" ||
          this.pool.pool_status === "cancelled") &&
        this.pool.chain === this.currentChain.NETWORK_NAME
      ) {
        this.claimable = true;
      }
    },
    async loadChainData() {
      await this.getChainBallotByID(this.poolID);
      // await this.updateSentimentByPoolID(this.poolID);
      // await this.updateCommentsByPoolID(this.poolID);
    }
    // sentimentValue(key) {
    //   if (this.pool.sentiment.length > 0)
    //     return this.pool.sentiment.find(el => el.key === key).value;
    //   else return 0;
    // },
    // async updateUserSentiment(side) {
    //   // TODO Check logic
    //   if (this.isAuthenticated) {
    //     await this.getChainSTART(this.accountName);
    //     const actions = [];
    //     if (this.START_info.liquid < 1 && this.START_info.balance < 1) {
    //       this.insufficient_start_show = true;
    //     } else {
    //       if (this.START_info.liquid < 1) {
    //         actions.push(
    //           this.$startBalanceToLiquidAction(
    //             this.$chainToQty(this.START_info),
    //             this.settings.social_fee
    //           )
    //         );
    //       }
    //       let vote = 0; // abstain
    //       if (side === "upvote" && this.userSentiment !== "upvote") vote = 1;
    //       else if (side === "downvote" && this.userSentiment !== "downvote")
    //         vote = -1;
    //       actions.push({
    //         account: process.env.CONTRACT_ADDRESS,
    //         name: "sentiment",
    //         data: {
    //           account: this.accountName,
    //           pool_id: this.poolID,
    //           vote: vote
    //         }
    //       });
    //       try {
    //         const transaction = await this.$store.$api.signTransaction(actions);
    //         await this.loadChainData();
    //         this.getPoolInfo();
    //       } catch (error) {
    //         this.$errorNotification(error);
    //       }
    //     }
    //   }
    // }
  },
  async mounted() {
    // get data from chain, write to store, get from store
    this.settings = await this.getPoolsSettings();
    this.ballotConfig = await this.getBallotConfig();
    this.stakePool = this.$chainToQty(this.settings.stake_pool);
    await this.loadChainData();
    this.getPoolInfo();
    await this.getChainSTART(this.accountName);

    // Start polling
    this.polling = setInterval(async () => {
      await this.loadChainData();
      this.getPoolInfo();
    }, 20000);

    // if rerouting with tab
    if (this.$route.query.tab == "allocations") {
      this.tab = "allocations";
    } else {
      this.tab = "details";
    }
  },
  beforeDestroy() {
    clearInterval(this.polling);
  },

  watch: {
    async accountName() {
      this.settings = await this.getPoolsSettings();
      await this.getChainSTART(this.accountName);
    }
  }
};
</script>

<style lang="scss" scoped>
.header-bg {
  height: 200px;
  margin-bottom: -100px;
  // background-position-y: 50%;
}
.join-pane {
  display: grid;
  grid-template-rows: min-content auto;
  grid-auto-rows: min-content min-content;
}
.token-info {
  min-width: 180px;
}
.token-info .border {
  border: 1px solid gray;
  border-radius: $card-corner-radius;
  padding: 20px;
  margin: 0;
}
.tab-button {
  background-color: white;
}
.active {
  color: $primary;
}
a {
  text-decoration: none;
  color: $primary;
}
.text-h3 {
  line-height: 22px;
}
@media only screen and (max-width: 375px) {
  .q-card {
    padding: 5px;
  }
}
</style>
