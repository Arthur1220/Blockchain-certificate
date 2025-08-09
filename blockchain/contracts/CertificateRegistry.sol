// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol"; // Importa o contrato Initializable para inicialização de contratos atualizáveis.
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol"; // Importa o contrato Ownable para controle de propriedade.
//import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol"; // Importa o contrato Pausable para funcionalidade de pausa/despausa.
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol"; // Importa o contrato UUPS para funcionalidade de upgrade UUPS.
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol"; // Importa o contrato ReentrancyGuard para proteção contra ataques de reentrância.

/** 
 * @title CertificateRegistry
 * @dev Contrato atualizável (UUPS) para registro de certificados.
 */
contract CertificateRegistry is
    Initializable,
    OwnableUpgradeable,
    //Pausable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    struct Certificate {
        bytes32 ipfsHash;
        bytes32 institutionIdHash;
        bytes32 userIdHash;
        address issuer;
        uint256 issueDate;
        bool isRevoked;
    }

    mapping(bytes32 => Certificate) private certificates;
    mapping(address => bool) private authorizedIssuers;

    event CertificateIssued(bytes32 indexed certificateIdHash, bytes32 ipfsHash, bytes32 indexed institutionIdHash, bytes32 indexed userIdHash, address issuer);
    event CertificateRevoked(bytes32 indexed certificateIdHash, address indexed revoker);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // --- Inicialização (substitui constructor) ---
    function initialize() public initializer {
        __Ownable_init(msg.sender);
        //__Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        // O deployer se torna o primeiro emissor autorizado
        authorizedIssuers[msg.sender] = true;
    }

    // --- UUPS: controle de quem pode atualizar ---
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // --- Controle de Emissores (Issuers) ---
    function addIssuer(address _issuer) external onlyOwner {
        authorizedIssuers[_issuer] = true;
    }

    function removeIssuer(address _issuer) external onlyOwner {
        authorizedIssuers[_issuer] = false;
    }

    function isIssuer(address _issuer) public view returns (bool) {
        return authorizedIssuers[_issuer];
    }
    
    // --- Pause/Unpause ---
    /*
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
    */

    // --- Lógica Principal ---
    function issueCertificate(bytes32 _certificateIdHash, bytes32 _ipfsHash, bytes32 _institutionIdHash, bytes32 _userIdHash)
        external
        //whenNotPaused
        nonReentrant
    {
        require(authorizedIssuers[msg.sender], "Not an authorized issuer");
        require(certificates[_certificateIdHash].issueDate == 0, "Certificate already issued");

        certificates[_certificateIdHash] = Certificate({
            ipfsHash: _ipfsHash,
            institutionIdHash: _institutionIdHash,
            userIdHash: _userIdHash,
            issuer: msg.sender,
            issueDate: block.timestamp,
            isRevoked: false
        });
        emit CertificateIssued(_certificateIdHash, _ipfsHash, _institutionIdHash, _userIdHash, msg.sender);
    }
    
    function revokeCertificate(bytes32 _certificateIdHash) external nonReentrant {
        Certificate storage cert = certificates[_certificateIdHash];
        require(cert.issueDate != 0, "Certificate does not exist");
        require(msg.sender == cert.issuer || msg.sender == owner(), "Not authorized to revoke");
        require(!cert.isRevoked, "Certificate already revoked");
        cert.isRevoked = true;
        emit CertificateRevoked(_certificateIdHash, msg.sender);
    }
    
    function getCertificate(bytes32 _certificateIdHash) external view returns (Certificate memory) {
        require(certificates[_certificateIdHash].issueDate != 0, "Certificate does not exist");
        return certificates[_certificateIdHash];
    }
}