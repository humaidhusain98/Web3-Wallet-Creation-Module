class Chain {
    constructor({name, chainId, providerUrl,isMainnet,currency}) {
        this.name = name;
        this.chainId = chainId;
        this.providerUrl = providerUrl;
        this.ethersProvider = providerUrl;
        this.isMainnet = isMainnet;
        this.currency = currency;
    }

}

module.exports = Chain;