const { ethers } = require("hardhat");

async function main() {
  // --- CONFIGURAÇÃO ---
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Substitua pelo endereço do seu contrato
  const addressToRevoke = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Substitua pelo endereço a ter a permissão revogada
  // --------------------

  const [owner] = await ethers.getSigners();
  console.log(`Usando a conta do dono (${owner.address}) para revogar a permissão...`);

  const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
  const certificateRegistry = await CertificateRegistry.attach(contractAddress);

  const isCurrentlyIssuer = await certificateRegistry.isIssuer(addressToRevoke);
  if (!isCurrentlyIssuer) {
    console.log(`O endereço ${addressToRevoke} já não tem permissão. Nenhuma ação necessária.`);
    return;
  }

  console.log(`Revogando permissão de emissor do endereço: ${addressToRevoke}`);
  const tx = await certificateRegistry.connect(owner).removeIssuer(addressToRevoke);
  await tx.wait();
  console.log("✅ Permissão revogada com sucesso!");

  const isNowIssuer = await certificateRegistry.isIssuer(addressToRevoke);
  console.log(`Status final: O endereço É um emissor? ${isNowIssuer}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});