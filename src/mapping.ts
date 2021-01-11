import { Address } from "@graphprotocol/graph-ts"
import { TransferSingle, TransferBatch, URI, ERC1155 } from "../generated/Rarible/ERC1155";
import { Transfer as EventTransferSupeRare } from "../generated/SupeRare/SupeRareV2";
import { ERC721, Transfer } from "../generated/templates/NftContract/ERC721"
import { NftContract, Nft } from "../generated/schema"
import { NiftyNFT } from "../generated/NiftyGateway/NiftyNFT"

export function handleTransfer(event: Transfer): void {
  let id = event.address.toHexString() + "/" + event.params.id.toString();
  let contract = ERC721.bind(event.address);
  let nft = Nft.load(id);
  if (nft == null) {
    nft = new Nft(id);
    nft.contract = event.address.toHexString();
    nft.tokenID = event.params.id;
    nft.tokenURI = contract.tokenURI(event.params.id);
  }

  nft.owner = event.params.to;
  nft.save();
}

export function handleTransferSingle(event: TransferSingle): void {
  let address = event.address.toHexString();
  if (NftContract.load(address) == null) {
    let nftContract = new NftContract(address);

    // TODO: refactor as Rarible is not ERC721
    // TODO: handle event.params._value
    nftContract.name = fetchName(event.address);
    nftContract.symbol = fetchSymbol(event.address);
    nftContract.platform = "Rarible";
    nftContract.save();
  }

  let id = address + "/" + event.params._id.toString();
  let contract = ERC1155.bind(event.address);
  let nft = Nft.load(id);
  if (nft == null) {
    nft = new Nft(id);
    nft.contract = address;
    nft.tokenID = event.params._id;
    nft.creatorAddress = contract.creators(event.params._id);
    nft.tokenURI = contract.uri(event.params._id);
  }

  nft.owner = event.params._to;
  nft.save();
}

export function handleTransferSupeRare(event: EventTransferSupeRare): void {
  let address = event.address.toHexString();
  if (NftContract.load(address) == null) {
    let nftContract = new NftContract(address);

    nftContract.name = fetchName(event.address);
    nftContract.symbol = fetchSymbol(event.address);
    nftContract.platform = "SupeRare";
    nftContract.save();
  }

  let id = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  let nft = Nft.load(id);
  if (nft.creatorName == null) {
    nft = new Nft(id);
    let contract = NiftyNFT.bind(event.address);
    nft.tokenID = event.params.tokenId;
    nft.creatorName = fetchName(contract)
    nft.tokenURI = contract.tokenURI(event.params.tokenId);
  }

  nft.owner = event.params.to
  nft.save();
}

export function handleTransferBatch(event: TransferBatch): void { 
  // TODO: implement
}

export function handleURI(event: URI): void { 
  let id = event.address.toHexString() + "/" + event.params._id.toString();
  let nft = new Nft(id);
  nft.tokenURI = event.params._value;
  nft.save();
}

export function fetchName(tokenAddress: Address): string {
  let contract = ERC721.bind(tokenAddress);
  return contract.name();
}

export function fetchSymbol(tokenAddress: Address): string {
  let contract = ERC721.bind(tokenAddress);
  return contract.symbol();
}
