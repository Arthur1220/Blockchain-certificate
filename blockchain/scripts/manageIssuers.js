const { ethers, upgrades } = require("hardhat");

async function main() {
  // Endereço do contrato já implantado
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Substitua pelo seu endereço de contrato
  
  // Endereço da carteira do nosso backend (uma das contas do 'npx hardhat node')
  const backendWalletAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Exemplo: Account #1

  console.log(`Anexando ao contrato em: ${contractAddress}`);
  const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
  const certificateRegistry = await CertificateRegistry.attach(contractAddress);

  // O 'owner' é a primeira conta da lista do Hardhat (Account #0)
  const [owner] = await ethers.getSigners();

  // 1. Verificando o status atual
  let isIssuer = await certificateRegistry.isIssuer(backendWalletAddress);
  console.log(`A carteira do backend (${backendWalletAddress}) É um emissor? ${isIssuer}`);

  if (!isIssuer) {
    // 2. Concedendo a permissão de emissor (Issuer)
    console.log("Concedendo o papel de emissor para a carteira do backend...");
    const tx = await certificateRegistry.connect(owner).addIssuer(backendWalletAddress);
    await tx.wait();
    console.log("Permissão concedida!");
  }

  isIssuer = await certificateRegistry.isIssuer(backendWalletAddress);
  console.log(`Status final: A carteira do backend (${backendWalletAddress}) É um emissor? ${isIssuer}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});