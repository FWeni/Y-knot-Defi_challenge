<template>

        <tr>
        <td class="text-left">{{vipAccount}}</td>
        <td class="text-right">{{vipLastClaimID}}</td>
        <td class="text-right">{{vipStakeBalance}}</td>
        <td class="text-right">{{vipTier}}</td>
        <td class="text-left">{{vipTierHistory}}</td>
        </tr>
       
</template>

<script lang="ts">
export default ({
    props:['vipAccount','vipLastClaimID','vipStakeBalance','vipTier','vipTierHistory'],

});
</script>