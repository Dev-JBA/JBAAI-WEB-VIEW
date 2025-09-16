// import InstallationGuideBlock from './components/InstallationGuideBlock';
import IntroductionBlock from "./components/IntroductionBlock";
import PricingBlock from "./components/PricingBlock";
import UsageGuideBlock from "./components/UsageGuideBlock";

function App() {
  return (
    <div className="App">
      <IntroductionBlock />
      <PricingBlock />
      {/* <InstallationGuideBlock /> */}
      <UsageGuideBlock />
    </div>
  );
}

export default App;
