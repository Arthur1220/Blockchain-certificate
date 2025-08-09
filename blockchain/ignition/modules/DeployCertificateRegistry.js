const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

/**
 * Este é um Módulo Ignition. Ele descreve de forma declarativa o que queremos que seja implantado na blockchain.
 */
module.exports = buildModule("CertificateRegistryModule", (m) => {
  // "m" é o construtor do módulo. Usamos ele para definir nossas operações.

  // Dizemos ao Ignition: "Eu quero um contrato implantado a partir do artefato 'CertificateRegistry'".
  // O Ignition cuida de todo o resto: pegar o ContractFactory, chamar .deploy(), esperar, etc.
  const certificateRegistry = m.contract("CertificateRegistry");

  // Retornamos o contrato do módulo. Isso permite que outros módulos possam usá-lo
  // e também mostra o resultado no resumo do deploy.
  return { certificateRegistry };
});