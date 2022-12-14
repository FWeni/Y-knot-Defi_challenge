<template>
  <router-link
    class="router-link"
    :to="{
      name: 'pooldetails',
      params: { id: poolID, chain: chain.toLowerCase() }
    }"
    :event="clickable ? '' : 'click'"
  >
    <q-card
      :class="
        `col bg-secondary text-black self-stretch ` +
          `${claimable ? 'claimable' : ''}` +
          `${hasHeadstart ? 'headstart' : ''}`
      "
    >
      <q-item>
        <q-item-section top>
          <token-avatar :token="pool.avatar" :avatarSize="60" />
        </q-item-section>
        <!-- chain avatar -->
        <q-item-section top side>
          <div class="text-accent row">
            <token-avatar
              class="q-mr-sm"
              :token="pool.chain"
              :avatarSize="28"
              style="padding: 4px"
            />
            <div class="column items-center justify-between">
              <status-badge
                :poolStatus="hasHeadstart ? 'headstart' : pool.pool_status"
              />
              <status-countdown
                v-if="pool.pool_status === 'upcoming' && !hasHeadstart"
                :deadline="pool.pool_open"
                mini
                @countdown-finished="getPoolInfo"
              />
            </div>
          </div>
        </q-item-section>
      </q-item>
      <q-card-section class="title-section">
        <h3 class="title">{{ pool.title }}</h3>
      </q-card-section>
      <q-card-section class="bottom-section row content-end">
        <div class="col-12 row justify-between">
          <div>
            <div class="text-h6">Hard cap</div>
            <p class="info-value">{{ hardCap }}</p>
          </div>
          <div>
            <div class="text-h6">Access</div>
            <p class="info-value">{{ pool.access_type }}</p>
          </div>
        </div>
        <div
          class="col-12"
          v-if="
            ['open', 'completed', 'filled', 'cancelled'].includes(
              pool.pool_status
            )
          "
        >
          <div class="text-h6 q-py-xs">Progress</div>
          <status-progress :progress="pool.progress" />
        </div>
      </q-card-section>
      <!-- if owner of pool -->
      <q-card-section v-if="created === true" class="row justify-center">
        <q-btn
          outline
          color="primary"
          :to="{
            name: 'updatepool',
            params: { id: poolID, chain: chain.toLowerCase() }
          }"
          label="Update pool"
        />
      </q-card-section>
      <q-inner-loading :showing="poolID === -1">
        <q-spinner-puff size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </router-link>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import tokenAvatar from "src/components/TokenAvatar";
import statusBadge from "src/components/poolinfo/status-badge";
import statusCountdown from "src/components/poolinfo/status-countdown";
import statusProgress from "src/components/poolinfo/status-progress";

export default {
  name: "Poolcard",
  props: {
    poolID: {
      type: Number,
      default: 0,
      required: true
    },
    chain: {
      default: "telos"
    },
    created: {
      default: false,
      required: false
    }
  },
  components: { statusBadge, statusCountdown, statusProgress, tokenAvatar },
  data() {
    return {
      pool: this.$defaultPoolInfo,
      polling: null,
      claimable: false,
      accountStakeInfo: {}
    };
  },
  computed: {
    ...mapGetters("pools", [
      "getAllPools",
      "getPoolByID",
      "getAllPoolIDs",
      "getPoolByIDChain"
    ]),
    ...mapGetters("account", ["isAuthenticated", "accountName"]),
    ...mapGetters("blockchains", ["currentChain"]),

    hardCap() {
      if (this.pool.hard_cap === "Loading") {
        return this.pool.hard_cap;
      } else {
        return (
          parseFloat(this.pool.hard_cap).toFixed(2) +
          " " +
          this.pool.base_token.sym.split(",")[1]
        );
      }
    },
    clickable() {
      return this.poolID === -1;
    },

    hasHeadstart() {
      // console.log(this.accountStakeInfo)indefined
      if (Object.keys(this.accountStakeInfo).length > 0) {
        if (
          this.accountStakeInfo.tier > 0 &&
          Date.now().valueOf() < this.pool.pool_open &&
          Date.now().valueOf() > this.pool.pool_open - 3 * 60 * 60 * 1000
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  },
  methods: {
    ...mapActions("pools", ["getAllocationByPool"]),
    ...mapActions("account", ["getChainAccountStakeInfo"]),

    getPoolInfo() {
      const pool = this.getPoolByIDChain(this.poolID, this.chain);
      if (pool !== undefined) {
        this.pool = this.getPoolByIDChain(this.poolID, this.chain);
      }
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
    }
  },
  async mounted() {
    this.getPoolInfo();
    await this.getClaimStatus();

    this.accountStakeInfo = await this.getChainAccountStakeInfo(
      this.accountName
    );
    // Start polling every 1min for any updates
    this.polling = setInterval(() => {
      this.getPoolInfo();
    }, 30000);
  },

  watch: {
    async accountName() {
      this.accountStakeInfo = await this.getChainAccountStakeInfo(
        this.accountName
      );
    }
  },

  beforeDestroy() {
    clearInterval(this.polling);
  }
};
</script>

<style lang="scss" scoped>
.q-card {
  transition: all 0.3s ease-in-out;
  min-width: 260px;
  max-width: 600px;
  padding: 10px;
  border-radius: $card-corner-radius;
  border-color: $secondary;
  box-shadow: 0 0 2vw 0 rgba(0, 0, 0, 0.08);
  &.claimable {
    border: 1px solid $accent;
  }
  &.headstart {
    border: 1px solid gold;
  }
}
.q-card:hover {
  transform: scale(1.05);
  z-index: 2;
}
.q-card .bottom-section {
  padding-bottom: 8px;
  padding-top: 0;
}

.q-card .title-section {
  min-height: 75px;
  padding-bottom: 0;
  & .title {
    margin: 0;
    padding: 0;
    line-height: 26px;
  }
}
.q-card .info-value {
  line-height: 30px;
  font-size: 20px;
  color: $primary;
  margin-bottom: 0px;
}
</style>
