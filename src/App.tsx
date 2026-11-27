import TallyBankTemplate from "./components/TallyBankTemplate";
import { Web3Provider } from "./web3/Web3Context";

export default function App() {
  return (
    <Web3Provider>
      <div className="w-full">
        <TallyBankTemplate fontHref={null} />
      </div>
    </Web3Provider>
  );
}
