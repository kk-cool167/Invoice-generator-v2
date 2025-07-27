# Invoice Generator v1

A comprehensive, multilingual invoice generation system with support for both Material Management (MM) and Financial Invoice (FI) modes. Built with React, TypeScript, and modern PDF generation capabilities.

## 🚀 Features

### Core Functionality
- **Dual Mode System**: Switch between MM (Material Management) and FI (Financial Invoice) modes
- **Multi-language Support**: German and English interface with proper localization
- **PDF Generation**: Professional invoice templates with customizable branding
- **Real-time Preview**: Live PDF preview with multiple template options
- **Currency Support**: Multi-currency handling with proper formatting (EUR, GBP, CHF, USD)

### PDF Templates
- **Business Standard**: Professional DIN 5008 compliant template
- **Allrauer**: Custom branded template with specialized layout
- **Classic**: Traditional business template with signature fields
- **Professional**: Modern template with blue accents
- **Business Green**: Eco-friendly template with green styling

### Mode-Specific Features

#### MM Mode (Material Management)
- Complete order and delivery management
- Order numbers, delivery dates, and tracking
- Processor and customer number management
- Full supply chain documentation

#### FI Mode (Financial Invoice)
- Streamlined financial documentation
- Focus on payment and accounting information
- VAT compliance and tax reporting
- Essential business details only

### Technical Features
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Type Safety**: Full TypeScript implementation
- **Component Library**: Built with shadcn/ui and Radix UI
- **State Management**: Zustand for efficient state handling
- **Form Validation**: React Hook Form with Zod validation
- **PDF Export**: High-quality PDF generation with @react-pdf/renderer

## 🛠 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/kk-cool167/Invoice-Generator-v1.git
   cd Invoice-Generator-v1/project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 📋 Usage

### Basic Workflow

1. **Select Mode**: Choose between MM (Material Management) or FI (Financial Invoice) mode
2. **Configure Invoice Details**: 
   - Invoice number and date
   - Vendor and recipient information
   - Payment terms and processor details
3. **Add Items**: Enter line items with descriptions, quantities, and pricing
4. **Choose Template**: Select from available PDF templates
5. **Generate PDF**: Preview and download the final invoice

### Mode Selection Guide

#### When to use MM Mode:
- Complete supply chain operations
- Order tracking and delivery management
- Detailed logistics documentation
- Multi-step procurement processes

#### When to use FI Mode:
- Simple financial transactions
- Accounting and payment focus
- Tax reporting requirements
- Streamlined business invoicing

## 🏗 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── InvoiceForm.tsx  # Main invoice form
│   ├── PDFViewer.tsx    # PDF preview component
│   └── ...
├── lib/                 # Utility libraries
│   ├── pdf/             # PDF generation logic
│   │   ├── templates/   # PDF template components
│   │   └── components/  # Shared PDF components
│   ├── api.ts           # API functions
│   └── utils.ts         # Helper utilities
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
└── context/             # React context providers
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_DATABASE_URL=your_database_url

# PDF Configuration
VITE_PDF_WORKER_URL=/js/pdf.worker.min.js

# Feature Flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_MULTI_CURRENCY=true
```

## 🚀 Deployment

### Vercel Deployment
```bash
npm install -g vercel
vercel --prod
```

### Netlify Deployment
```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🐛 Troubleshooting

### Common Issues

1. **PDF Generation Fails**
   - Check PDF worker configuration
   - Verify image URLs are accessible
   - Ensure all required fields are provided

2. **Template Not Loading**
   - Verify template name matches registration
   - Check template file paths
   - Ensure template exports are correct

3. **Build Errors**
   - Run `npm run build` to check TypeScript errors
   - Verify all dependencies are installed
   - Check for missing environment variables

## 🤝 Contributing

### Development Guidelines

1. **Code Style**: Follow TypeScript and React best practices
2. **Commits**: Use conventional commit messages
3. **Testing**: Add tests for new functionality
4. **Documentation**: Update README for new features

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation

## 🔄 Version History

### v1.0.0 (Latest)
- ✅ Complete FI/MM mode separation
- ✅ Multi-template PDF generation
- ✅ Multilingual support (DE/EN)
- ✅ Currency formatting system
- ✅ Responsive design implementation
- ✅ Production build optimization

## 📝 Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **PDF Generation**: @react-pdf/renderer
- **State Management**: Zustand, React Hook Form
- **Build Tools**: Vite, PostCSS
- **Backend**: Node.js, Express

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ using React, TypeScript, and modern web technologies** 