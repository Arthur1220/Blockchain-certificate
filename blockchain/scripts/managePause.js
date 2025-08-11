const { ethers } = require("hardhat");

async function main() {
  // --- CONFIGURAÇÃO ---
  // Ação a ser executada: 'pause' ou 'unpause'
  const ACTION = "pause"; // Mude para "unpause" para despausar

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Substitua pelo endereço do seu contrato
  // --------------------

  const [owner] = await ethers.getSigners();
  const CertificateRegistry = await ethers.getContractFactory("CertificateRegistry");
  const certificateRegistry = await CertificateRegistry.attach(contractAddress);

  const isPaused = await certificateRegistry.paused();
  console.log(`O contrato está atualmente pausado? ${isPaused}`);

  if (ACTION === "pause") {
    if (isPaused) {
      console.log("O contrato já está pausado. Nenhuma ação necessária.");
      return;
    }
    console.log("Pausando o contrato...");
    const tx = await certificateRegistry.connect(owner).pause();
    await tx.wait();
    console.log("✅ Contrato pausado com sucesso!");
  } else if (ACTION === "unpause") {
    if (!isPaused) {
      console.log("O contrato não está pausado. Nenhuma ação necessária.");
      return;
    }
    console.log("Despausando o contrato...");
    const tx = await certificateRegistry.connect(owner).unpause();
    await tx.wait();
    console.log("✅ Contrato despausado com sucesso!");
  } else {
    console.error("Ação inválida. Escolha 'pause' ou 'unpause'.");
    process.exit(1);
  }

  const finalStatus = await certificateRegistry.paused();
  console.log(`Status final: O contrato está pausado? ${finalStatus}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});