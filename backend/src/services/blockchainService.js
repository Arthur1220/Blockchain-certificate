import { ethers } from 'ethers';
import config from '../config/index.js';
import AppError from '../errors/AppError.js';
import { certificateRegistryABI } from '../contracts/abi.js'; 

const provider = new ethers.JsonRpcProvider(config.blockchain.nodeUrl);
const backendWallet = new ethers.Wallet(config.blockchain.privateKey, provider);
const certificateRegistryContract = new ethers.Contract(
  config.blockchain.contractAddress,
  certificateRegistryABI,
  backendWallet
);

console.log(`🔗 Blockchain Service conectado ao contrato em: ${config.blockchain.contractAddress}`);

/**
 * Registra a prova de um certificado na blockchain.
 * @param {object} certificateData - Dados do certificado do nosso banco de dados.
 * @returns {Promise<string>} O hash da transação na blockchain.
 */
export const issueCertificateOnChain = async (certificateData) => {
  try {
    const certificateIdHash = ethers.id(certificateData.id); // Hash do ID do certificado (CUID)
    const institutionIdHash = ethers.id(certificateData.institutionId); // Hash do ID da instituição
    const userIdHash = ethers.id(certificateData.ownerId); // Hash do ID do aluno
    const ipfsHashBytes32 = ethers.id(certificateData.ipfsHash); // Transforma o hash do IPFS em bytes32 (se necessário)

    console.log(`Submetendo certificado ${certificateData.id} para a blockchain...`);

    const tx = await certificateRegistryContract.issueCertificate(
      certificateIdHash,
      ipfsHashBytes32,
      institutionIdHash,
      userIdHash
    );

    const receipt = await tx.wait();
    console.log(`✅ Certificado registrado com sucesso! Transaction Hash: ${receipt.transactionHash}`);
    
    return receipt.transactionHash;

  } catch (error) {
    console.error("❌ Erro ao registrar o certificado na blockchain:", error.reason || error.message);
    throw new AppError('Failed to issue certificate on the blockchain.', 500);
  }
};

/**
 * Busca os dados de um certificado diretamente da blockchain para verificação.
 * @param {string} certificateId - O ID (CUID) do certificado do nosso banco de dados.
 * @returns {Promise<object|null>} Um objeto com os dados da prova on-chain, ou null se não for encontrado.
 */
export const getCertificateFromChain = async (certificateId) => {
  try {
    const certificateIdHash = ethers.id(certificateId);
    
    console.log(`Buscando certificado ${certificateId} na blockchain...`);

    // Chama a função 'getCertificate' do Smart Contract (que é uma 'view', não gasta gás)
    const onChainData = await certificateRegistryContract.getCertificate(certificateIdHash);

    // O contrato retorna uma tupla (array), então precisamos mapear para um objeto
    const [ipfsHash, institutionIdHash, userIdHash, issuer, issueDate, isRevoked] = onChainData;

    // Se a data de emissão for 0, o certificado não existe no contrato
    if (issueDate === 0n) { // BigInt comparison
        console.log(`Certificado ${certificateId} não encontrado na blockchain.`);
        return null;
    }

    return {
      ipfsHash,
      institutionIdHash,
      userIdHash,
      issuer,
      issueDate: new Date(Number(issueDate) * 1000).toISOString(), // Converte timestamp para data
      isRevoked,
    };
  } catch (error) {
    console.error("❌ Erro ao buscar o certificado na blockchain:", error.reason || error.message);
    throw new Error('Failed to get certificate from the blockchain.');
  }
};


/**
 * Revoga um certificado na blockchain.
 * @param {string} certificateId - O ID (CUID) do certificado a ser revogado.
 * @returns {Promise<string>} O hash da transação de revogação.
 */
export const revokeCertificateOnChain = async (certificateId) => {
  try {
    const certificateIdHash = ethers.id(certificateId);

    console.log(`Revogando certificado ${certificateId} na blockchain...`);
    
    // Chama a função 'revokeCertificate' do Smart Contract
    const tx = await certificateRegistryContract.revokeCertificate(certificateIdHash);

    const receipt = await tx.wait();

    console.log(`✅ Certificado revogado com sucesso! Transaction Hash: ${receipt.transactionHash}`);

    return receipt.transactionHash;
  } catch (error) {
    console.error("❌ Erro ao revogar o certificado na blockchain:", error.reason || error.message);
    throw new Error('Failed to revoke certificate on the blockchain.');
  }
};