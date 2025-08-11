const { ethers } = require("hardhat");

async function main() {
  // --- CONFIGURAÇÃO ---
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Substitua pelo endereço do seu contrato
  const addressToCheck = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Substitua pelo endereço que você quer verificar
  // --------------------

  if (!ethers.isAddress(addressToCheck)) {
    console.error("Erro: Endereço inválido.");
    process.exit(1);
  }

  const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
  const certificateRegistry = await CertificateRegistry.attach(contractAddress);

  console.log(`Verificando permissão de emissor para o endereço: ${addressToCheck}`);
  
  const isIssuer = await certificateRegistry.isIssuer(addressToCheck);

  if (isIssuer) {
    console.log("✅ Sim, este endereço TEM permissão para emitir certificados.");
  } else {
    console.log("❌ Não, este endereço NÃO TEM permissão para emitir certificados.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});