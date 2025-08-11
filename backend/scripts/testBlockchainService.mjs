import * as blockchainService from '../src/services/blockchainService.js';
import { ethers } from 'ethers';

async function runTest() {
  console.log('--- INICIANDO TESTE DIRETO DO BLOCKCHAIN SERVICE ---');

  const mockCertificate = {
    id: `cert-${Date.now()}`,
    ownerId: `user-${Date.now()}`,
    institutionId: `inst-${Date.now()}`,
    ipfsHash: `Qm-${Date.now()}`,
  };

  console.log('\n[ETAPA 1: Emissão de Certificado]');
  console.log('Dados a serem registrados:', mockCertificate);

  try {
    const transactionHash = await blockchainService.issueCertificateOnChain(mockCertificate);
    console.log('✅ SUCESSO! Transação de emissão enviada.');
    console.log('Transaction Hash:', transactionHash);
    if (!transactionHash.startsWith('0x')) {
      throw new Error("O valor retornado não parece um transaction hash válido.");
    }
  } catch (error) {
    console.error('❌ FALHA na emissão do certificado:', error.message);
    process.exit(1);
  }

  console.log('\n[ETAPA 2: Busca do Certificado na Blockchain]');
  try {
    const onChainData = await blockchainService.getCertificateFromChain(mockCertificate.id);
    if (onChainData) {
      console.log('✅ SUCESSO! Dados encontrados na blockchain:');
      console.log({ ...onChainData, issueDate: new Date(onChainData.issueDate).toLocaleString() });
      const expectedIpfsHash = ethers.id(mockCertificate.ipfsHash);
      if(onChainData.ipfsHash === expectedIpfsHash) {
        console.log("-> Verificação de IPFS Hash: CORRETO");
      } else {
        console.error("-> Verificação de IPFS Hash: INCORRETO");
      }
    } else {
      console.error('❌ FALHA! Certificado não encontrado na blockchain após a emissão.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ FALHA na busca do certificado:', error.message);
    process.exit(1);
  }

  console.log('\n[ETAPA 3: Revogação do Certificado]');
  try {
    const revocationTxHash = await blockchainService.revokeCertificateOnChain(mockCertificate.id);
    console.log('✅ SUCESSO! Transação de revogação enviada.');
    console.log('Revocation Tx Hash:', revocationTxHash);
    
    const revokedData = await blockchainService.getCertificateFromChain(mockCertificate.id);
    if (revokedData && revokedData.isRevoked) {
      console.log('-> Verificação de Status: O certificado está agora como REVOGADO.');
    } else {
      console.error('-> Verificação de Status: FALHA, o certificado não foi revogado.');
    }
  } catch (error) {
    console.error('❌ FALHA na revogação do certificado:', error.message);
    process.exit(1); // <-- Linha corrigida
  }
  
  console.log('\n--- TESTE CONCLUÍDO COM SUCESSO ---');
}

runTest();