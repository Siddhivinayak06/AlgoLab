# Algorithm Performance Analyzer

A comprehensive educational platform for visualizing and understanding algorithm efficiency through interactive demonstrations, real-time metrics, and empirical performance analysis.

## 🎯 Overview

The Algorithm Performance Analyzer helps students and developers:
- **Visualize** sorting and searching algorithms in action
- **Track** real-time metrics (comparisons, operations, execution time)
- **Compare** algorithm performance side-by-side
- **Analyze** empirical complexity curves
- **Understand** Big O notation through interactive examples

## ✨ Key Features

### 1. Algorithm Visualizer
Watch sorting algorithms animate step-by-step with:
- **Bubble Sort** - Simple O(n²) algorithm
- **Quick Sort** - Efficient O(n log n) divide-and-conquer
- **Merge Sort** - Guaranteed O(n log n) stable sort

Controls include:
- Play/Pause/Resume execution
- Variable speed adjustment
- Dynamic array size selection
- Multiple data type generators
- Real-time metrics display

### 2. Binary Search Visualizer
Explore the efficient binary search algorithm:
- Target value search visualization
- Visual representation of search space reduction
- Step-by-step execution tracking
- O(log n) complexity demonstration

### 3. Algorithm Racing Mode
Compare two algorithms side-by-side:
- Simultaneous execution on identical data
- Individual metric tracking
- Winner detection based on completion time
- Direct performance comparison

### 4. Performance Analysis
Run comprehensive empirical testing:
- Automated testing with multiple array sizes
- Execution time and operation count graphs
- Complexity curve visualization
- Detailed results table with statistics

### 5. Dashboard Hub
Central navigation featuring:
- Quick access to all visualizers
- Feature descriptions and icons
- Recent experiments tracking
- Team information

## 🚀 Quick Start

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd v0-project

# Install dependencies
pnpm install
```

### Running the Application
```bash
# Development mode with hot reload
pnpm dev

# Open browser to http://localhost:3000
```

### Building for Production
```bash
# Create optimized build
pnpm build

# Start production server
pnpm start
```

## 📖 Usage Guide

### Getting Started
1. Visit `/dashboard` to see all available features
2. Choose a visualizer (Visualizer, Racing, or Analysis)
3. Configure your test (array size, algorithm, data type)
4. Click Start and watch the algorithm execute
5. Analyze the metrics and results

### Understanding the Interface

**Color Coding**:
- 🔵 **Blue**: Unsorted/default elements
- 🔴 **Red**: Elements being compared
- 🟣 **Purple**: Sorted/processed elements
- 🟢 **Green**: Found elements (binary search)

**Metrics Explained**:
- **Comparisons**: Number of comparison operations
- **Operations**: Total operations including swaps
- **Time**: Wall-clock execution time in milliseconds
- **Steps**: Algorithm iterations (binary search)

### Advanced Usage

#### Custom Arrays
Input your own values (comma-separated, values 1-100):
```
Custom Array: 5,2,8,1,9,3,7
```

#### Testing Hypotheses
1. Compare different data types with same algorithm
2. Race two algorithms with varying sizes
3. Run analysis to see complexity curves
4. Draw conclusions from metrics

## 📊 Algorithm Complexity Reference

| Algorithm | Best | Average | Worst | Space |
|-----------|------|---------|-------|-------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Binary Search | O(1) | O(log n) | O(log n) | O(1) |

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org) - React framework with App Router
- **React**: v19 with hooks
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) - Utility-first CSS
- **Animations**: [Framer Motion v11](https://www.framer.com/motion) - Smooth animations
- **Charts**: [Recharts](https://recharts.org) - React charting library
- **UI Components**: [shadcn/ui](https://ui.shadcn.com) - Accessible component library
- **Icons**: [Lucide React](https://lucide.dev) - Beautiful SVG icons

### Development
- **Language**: TypeScript - Type-safe JavaScript
- **Package Manager**: pnpm
- **Build Tool**: Next.js native bundling (Turbopack)

## 📁 Project Structure

```
algorithm-performance-analyzer/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles & theme
│   ├── dashboard/              # Dashboard page
│   ├── visualizer/             # Sorting visualizer
│   ├── binary-search/          # Search visualizer
│   ├── racing/                 # Algorithm racing
│   ├── analysis/               # Performance analysis
│   └── about/                  # Team information
├── components/
│   ├── algorithm-visualizer.tsx
│   ├── binary-search-visualizer.tsx
│   ├── metrics-panel.tsx
│   ├── dataset-generator.tsx
│   ├── dashboard-nav.tsx
│   └── ui/                     # shadcn components
├── lib/
│   ├── algorithms.ts           # Algorithm implementations
│   └── utils.ts                # Utility functions
├── public/                     # Static assets
├── FEATURES.md                 # Feature documentation
├── USAGE_GUIDE.md              # User guide
└── IMPLEMENTATION_SUMMARY.md   # Implementation details
```

## 🎨 Design System

### Color Palette
- **Primary**: Purple (280°) - Main brand color
- **Secondary**: Blue (220°) - Status indicators
- **Accent**: Cyan (280°) - Emphasis elements
- **Background**: Dark navy (#0f0c3f) - Dark theme
- **Surfaces**: Semi-transparent with blur - Glassmorphic

### Typography
- **Headings**: Geist Sans (Bold)
- **Body**: Geist Sans (Regular)
- **Code**: Geist Mono

### Responsive Breakpoints
- Mobile: <640px
- Tablet: 640px - 1024px
- Desktop: >1024px

## 📚 Documentation

- **[FEATURES.md](./FEATURES.md)** - Comprehensive feature documentation
- **[USAGE_GUIDE.md](./USAGE_GUIDE.md)** - Step-by-step user guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical details

## 🔧 Configuration

### Environment Variables
No environment variables required for basic functionality.

### Build Configuration
Default Next.js configuration with Turbopack bundler.

### Performance Optimization
- CSS-in-JS optimization via Tailwind
- Image optimization
- Code splitting
- Route prefetching

## 🤝 Contributing

To contribute improvements:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

### Areas for Contribution
- Additional sorting algorithms
- More search algorithms
- Enhanced visualizations
- Better accessibility features
- Performance improvements
- Documentation improvements

## 📋 Feature Roadmap

### Completed ✓
- Core algorithm visualizations
- Metrics tracking system
- Algorithm racing mode
- Performance analysis dashboard
- Responsive design
- Dark theme with glassmorphism
- Navigation system

### In Progress
- Backend integration
- User authentication
- Experiment persistence

### Planned
- Image pixel sorting
- PDF report generation
- Advanced algorithm implementations
- Admin analytics dashboard
- Interactive tutorials

## 🐛 Known Issues

None currently reported.

## 💡 Tips for Learning

1. **Start with Bubble Sort** to understand basic algorithm flow
2. **Compare algorithms** using the Racing mode
3. **Vary array sizes** in the Visualizer to see complexity impacts
4. **Run full analysis** to see mathematical curves
5. **Test different data types** to understand best/worst cases
6. **Watch carefully** to understand comparison patterns

## 🎓 Educational Value

This tool teaches:
- **Algorithm fundamentals** - How sorting and searching work
- **Complexity analysis** - Understanding Big O notation
- **Performance comparison** - Empirical vs theoretical
- **Data structure impact** - How data arrangement affects performance
- **Algorithm selection** - Choosing the right algorithm for the task

## 📞 Support

For issues, questions, or suggestions:
1. Check the [USAGE_GUIDE.md](./USAGE_GUIDE.md) for common questions
2. Review [FEATURES.md](./FEATURES.md) for feature details
3. Check console for error messages
4. Report issues with detailed description

## 📝 License

This project is created as an educational tool for learning purposes.

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [shadcn/ui](https://ui.shadcn.com)
- [Recharts](https://recharts.org)

## 📊 Statistics

- **4 Sorting Algorithms** - Bubble, Quick, Merge + Binary Search
- **5 Major Pages** - Dashboard, Visualizer, Racing, Analysis, About
- **7 Reusable Components** - Modular architecture
- **3 Chart Types** - Time, operations, comparison
- **100% Responsive** - Mobile to desktop
- **Smooth Animations** - 60 FPS performance target

---

**Created for Full Stack Development Laboratory - FENRIR Team**
Fr. C. Rodrigues Institute of Technology, Vashi, Navi Mumbai

**Start exploring algorithms today!** 🚀
