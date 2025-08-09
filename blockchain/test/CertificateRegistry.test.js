const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat"); // <-- Importa 'upgrades' aqui

describe("CertificateRegistry", function () {
  let certificateRegistry;
  let owner, addr1, addr2;

  const certIdHash = ethers.id("CERT-001");
  const ipfsHash = ethers.id("IPFS-HASH-XYZ");
  const instIdHash = ethers.id("INST-ID");
  const userIdHash = ethers.id("USER-ID");

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const CertificateRegistryFactory = await ethers.getContractFactory("CertificateRegistry");
    
    // CORREÇÃO: Usa 'upgrades.deployProxy' para implantar o contrato atualizável
    certificateRegistry = await upgrades.deployProxy(CertificateRegistryFactory, [], {
      initializer: "initialize",
      kind: "uups"
    });
    
  });

  describe("Issuance and Revocation", function () {
    it("Should issue a certificate with all required data", async function () {
      await expect(certificateRegistry.issueCertificate(certIdHash, ipfsHash, instIdHash, userIdHash))
        .to.emit(certificateRegistry, "CertificateIssued");

      const cert = await certificateRegistry.getCertificate(certIdHash);
      expect(cert.ipfsHash).to.equal(ipfsHash);
      expect(cert.isRevoked).to.be.false;
    });

    it("Should allow the issuer to revoke a certificate", async function () {
      await certificateRegistry.issueCertificate(certIdHash, ipfsHash, instIdHash, userIdHash);
      await certificateRegistry.revokeCertificate(certIdHash);
      const cert = await certificateRegistry.getCertificate(certIdHash);
      expect(cert.isRevoked).to.be.true;
    });
  });

  describe("Access Control", function () {
    it("Should prevent non-issuers from issuing certificates", async function () {
      await expect(
        certificateRegistry.connect(addr2).issueCertificate(certIdHash, ipfsHash, instIdHash, userIdHash)
      ).to.be.revertedWith("Not an authorized issuer");
    });

    it("Should allow owner to grant and revoke issuer role", async function () {
      await certificateRegistry.addIssuer(addr1.address);
      expect(await certificateRegistry.isIssuer(addr1.address)).to.be.true;
      
      await expect(
        certificateRegistry.connect(addr1).issueCertificate(certIdHash, ipfsHash, instIdHash, userIdHash)
      ).to.not.be.reverted;

      await certificateRegistry.removeIssuer(addr1.address);
      expect(await certificateRegistry.isIssuer(addr1.address)).to.be.false;
    });
  });
});