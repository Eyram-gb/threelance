// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ThreeLance {
	address public owner;

	// Struct to store details of a purchase by a buyer
	struct Purchase {
		address payable buyer;
		uint256 price;
		bool buyerConfirmed;
		bool providerConfirmed;
		bool isActive;
	}

	// Struct to store details of a service
	struct Service {
		uint256 id;
		address payable provider;
		uint256 price;
		bool isActive;
		uint256 buyerCount;
		string name;
		string description;
		string[] mediaLinks; // Array of strings to store multiple media links
		mapping(uint256 => Purchase) purchases;
	}

	// Events
	event ServiceCreated(
		uint256 indexed id,
		address indexed provider,
		uint256 price,
		string name,
		string description,
		string[] mediaLinks
	);
	event ServiceBought(
		uint256 indexed id,
		address indexed buyer,
		uint256 purchaseId
	);
	event PaymentReleased(uint256 indexed id, uint256 purchaseId);
	event BuyerConfirmed(uint256 indexed id, uint256 indexed purchaseId);
	event ProviderConfirmed(uint256 indexed id, uint256 indexed purchaseId);
	event RefundIssued(
		uint256 indexed id,
		uint256 indexed purchaseId,
		address indexed buyer
	);

	// Variables
	uint256 public serviceCount;
	mapping(uint256 => Service) public services;
	mapping(address => uint256[]) public providerServices; // Mapping of provider address to array of service IDs

	// Modifier to restrict access to the contract owner
	modifier onlyOwner() {
		require(
			msg.sender == owner,
			"Only contract owner can call this function"
		);
		_;
	}

	// Constructor to set the contract owner
	constructor() {
		owner = msg.sender;
	}

	// Create a new service
	function createService(
		string memory _name,
		string memory _description,
		uint256 _price,
		string[] memory _mediaLinks
	) public {
		require(_price > 0, "Price must be greater than zero");

		serviceCount++;
		Service storage newService = services[serviceCount];
		newService.id = serviceCount;
		newService.provider = payable(msg.sender);
		newService.price = _price;
		newService.isActive = true;
		newService.name = _name;
		newService.description = _description;
		newService.mediaLinks = _mediaLinks;

		// Add service ID to the provider's list of services
		providerServices[msg.sender].push(serviceCount);

		emit ServiceCreated(
			serviceCount,
			msg.sender,
			_price,
			_name,
			_description,
			_mediaLinks
		);
	}

	// Buy a service (commit payment to escrow)
	function buyService(uint256 _id) public payable {
		Service storage service = services[_id];
		require(service.isActive, "Service not available");
		require(msg.value == service.price, "Incorrect payment amount");

		service.buyerCount++;
		service.purchases[service.buyerCount] = Purchase({
			buyer: payable(msg.sender),
			price: msg.value,
			buyerConfirmed: false,
			providerConfirmed: false,
			isActive: true
		});

		emit ServiceBought(_id, msg.sender, service.buyerCount);
	}

	// Mark service as complete by buyer
	function confirmByBuyer(uint256 _id, uint256 _purchaseId) public {
		Service storage service = services[_id];
		Purchase storage purchase = service.purchases[_purchaseId];
		require(msg.sender == purchase.buyer, "Only buyer can confirm");
		require(purchase.isActive, "Purchase not active");

		purchase.buyerConfirmed = true;
		emit BuyerConfirmed(_id, _purchaseId);

		_tryReleasePayment(_id, _purchaseId);
	}

	// Mark service as complete by provider
	function confirmByProvider(uint256 _id, uint256 _purchaseId) public {
		Service storage service = services[_id];
		Purchase storage purchase = service.purchases[_purchaseId];
		require(msg.sender == service.provider, "Only provider can confirm");
		require(purchase.isActive, "Purchase not active");

		purchase.providerConfirmed = true;
		emit ProviderConfirmed(_id, _purchaseId);

		_tryReleasePayment(_id, _purchaseId);
	}

	// Internal function to release payment if both parties have confirmed
	function _tryReleasePayment(uint256 _id, uint256 _purchaseId) internal {
		Service storage service = services[_id];
		Purchase storage purchase = service.purchases[_purchaseId];

		if (purchase.buyerConfirmed && purchase.providerConfirmed) {
			purchase.isActive = false;
			service.provider.transfer(purchase.price);

			emit PaymentReleased(_id, _purchaseId);
		}
	}

	// Refund to buyer if service is inactive or conditions are not met, handled by the owner
	function issueRefund(uint256 _id, uint256 _purchaseId) public onlyOwner {
		Service storage service = services[_id];
		Purchase storage purchase = service.purchases[_purchaseId];
		require(purchase.isActive, "Purchase not active");

		purchase.isActive = false;
		purchase.buyer.transfer(purchase.price);

		emit RefundIssued(_id, _purchaseId, purchase.buyer);
	}

	// Get all services with pagination
	function getAllServices(
		uint256 _page,
		uint256 _pageSize
	)
		public
		view
		returns (
			uint256[] memory ids,
			address[] memory providers,
			uint256[] memory prices,
			bool[] memory isActive,
			uint256[] memory buyerCounts,
			string[] memory names,
			string[] memory descriptions,
			string[][] memory mediaLinksArray
		)
	{
		// Calculate the start and end indices for the requested page
		uint256 start = (_page - 1) * _pageSize;
		uint256 end = start + _pageSize;

		// Ensure that the end index does not exceed the total number of services
		if (end > serviceCount) {
			end = serviceCount;
		}

		// Calculate the size of the array to return
		uint256 size = end > start ? end - start : 0;

		// Initialize arrays to hold the paginated data
		ids = new uint256[](size);
		providers = new address[](size);
		prices = new uint256[](size);
		isActive = new bool[](size);
		buyerCounts = new uint256[](size);
		names = new string[](size);
		descriptions = new string[](size);
		mediaLinksArray = new string[][](size);

		// Populate the arrays with the service data
		for (uint256 i = 0; i < size; i++) {
			Service storage service = services[start + i + 1];
			ids[i] = service.id;
			providers[i] = service.provider;
			prices[i] = service.price;
			isActive[i] = service.isActive;
			buyerCounts[i] = service.buyerCount;
			names[i] = service.name;
			descriptions[i] = service.description;
			mediaLinksArray[i] = service.mediaLinks;
		}
	}

	// Get purchase details for a specific service and purchase ID
	function getPurchase(
		uint256 _id,
		uint256 _purchaseId
	) public view returns (Purchase memory) {
		return services[_id].purchases[_purchaseId];
	}
}
