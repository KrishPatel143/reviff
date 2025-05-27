// lib/data/mock-order.js

export function getMockOrder(id) {
    return {
      id: id,
      title: "Professional Website Design",
      status: "In Progress",
      price: 199,
      orderDate: "Mar 15, 2023",
      deliveryDate: "Mar 25, 2023",
      description:
        "Create a professional website design for my business. The website should be responsive, modern, and user-friendly. It should include a home page, about page, services page, and contact page.",
      seller: {
        name: "John Doe",
        avatar: "/placeholder.svg?height=48&width=48",
        rating: 4.9,
        reviews: 120,
        level: "Top Rated",
      },
      progress: 60,
      milestones: [
        { id: 1, title: "Initial Design Concept", status: "completed", date: "Mar 17, 2023" },
        { id: 2, title: "Homepage Development", status: "in-progress", date: "Mar 20, 2023" },
        { id: 3, title: "Inner Pages Development", status: "pending", date: "Mar 22, 2023" },
        { id: 4, title: "Responsive Testing", status: "pending", date: "Mar 24, 2023" },
        { id: 5, title: "Final Delivery", status: "pending", date: "Mar 25, 2023" },
      ],
      files: [
        { id: 1, name: "design-concept.pdf", size: "2.4 MB", date: "Mar 17, 2023", type: "pdf" },
        { id: 2, name: "homepage-mockup.jpg", size: "1.8 MB", date: "Mar 18, 2023", type: "image" },
        { id: 3, name: "color-palette.png", size: "0.5 MB", date: "Mar 18, 2023", type: "image" },
      ],
      messages: [
        {
          id: 1,
          sender: "seller",
          text: "Hi there! I've received your order and I'm excited to work on your website design. Could you please provide more details about your business and any specific design preferences you have?",
          time: "Mar 15, 2023 • 10:30 AM",
        },
        {
          id: 2,
          sender: "buyer",
          text: "Hello! Thanks for accepting my order. My business is a fitness studio that offers yoga and pilates classes. I'd like a clean, modern design with a calming color palette - think blues and greens. I've attached our logo and some examples of websites I like.",
          time: "Mar 15, 2023 • 11:45 AM",
        },
        {
          id: 3,
          sender: "seller",
          text: "Perfect! I'll start working on some initial concepts based on your preferences. I'll have something for you to review by tomorrow. Is there anything specific you'd like to highlight on the homepage?",
          time: "Mar 15, 2023 • 12:15 PM",
        },
        {
          id: 4,
          sender: "buyer",
          text: "Yes, I'd like to highlight our class schedule and a special promotion for new members. Also, it would be great to have a section for instructor bios.",
          time: "Mar 15, 2023 • 2:30 PM",
        },
        {
          id: 5,
          sender: "seller",
          text: "I've completed the initial design concept for your website. Please take a look at the attached PDF and let me know your thoughts. I've focused on creating a clean, modern design with the blue and green color palette you mentioned.",
          time: "Mar 17, 2023 • 9:00 AM",
          attachment: "design-concept.pdf",
        },
        {
          id: 6,
          sender: "buyer",
          text: "I love the design concept! The color palette is perfect, and I like how you've organized the homepage. Could we make the call-to-action buttons a bit more prominent?",
          time: "Mar 17, 2023 • 11:20 AM",
        },
        {
          id: 7,
          sender: "seller",
          text: "I'm glad you like it! Yes, I can definitely make the CTA buttons more prominent. I'll work on that and also start developing the homepage based on the approved concept.",
          time: "Mar 17, 2023 • 12:05 PM",
        },
        {
          id: 8,
          sender: "seller",
          text: "Here's the homepage mockup with the updated CTA buttons. What do you think?",
          time: "Mar 18, 2023 • 3:45 PM",
          attachment: "homepage-mockup.jpg",
        },
      ],
    }
  }
  
  // Helper function to get status color
  export function getStatusColor(status) {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-blue-500"
      case "pending":
        return "bg-gray-300"
      default:
        return "bg-gray-300"
    }
  }
  
  // Helper function to get file icon
  export function getFileIcon(type, FileText, Image) {
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />
      case "image":
        return (
          <Image
            src="/placeholder.svg?height=20&width=20"
            alt="Image"
            width={20}
            height={20}
            className="h-5 w-5 rounded"
          />
        )
      default:
        return <FileText className="h-5 w-5" />
    }
  }