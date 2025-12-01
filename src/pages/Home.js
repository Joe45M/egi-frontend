import Slider from "../components/Slider";
import Posts from "../components/Posts";

function Home() {
  return (
    <div>
        <Slider></Slider>

        <div className="bg-accent-violet-950/10 py-3">
            <ul className="flex justify-center items-center gap-4 tracking-wider">
                <li className="text-gray-300  hover:text-accent-violet-300 transition-colors duration-300">
                    <a href="">Battlefield</a>
                </li>
                <li className="text-gray-500">
                    /
                </li>
                <li className="text-gray-300  hover:text-accent-violet-300 transition-colors duration-300">
                    <a href="">Call of Duty</a>
                </li>
                <li className="text-gray-500">
                    /
                </li>
                <li className="text-gray-300  hover:text-accent-violet-300 transition-colors duration-300">
                    <a href="">Fortnite</a>
                </li>
                <li className="text-gray-500">
                    /
                </li>
                <li className="text-gray-300  hover:text-accent-violet-300 transition-colors duration-300">
                    <a href="">GTA</a>
                </li>
                <li className="text-gray-500">
                    /
                </li>
                <li className="text-gray-300  hover:text-accent-violet-300 transition-colors duration-300">
                    <a href="">PUBG</a>
                </li>
                <li className="text-gray-500">
                    /
                </li>
                <li className="text-gray-300  hover:text-accent-violet-300 transition-colors duration-300">
                    <a href="">Apex Legends</a>
                </li>
                <li className="text-gray-500">
                    /
                </li>
                <li className="text-gray-300  hover:text-accent-violet-300 transition-colors duration-300">
                    <a href="">Overwatch</a>
                </li>
                <li className="text-gray-500">
                    /
                </li>
                <li className="text-gray-300  hover:text-accent-violet-300 transition-colors duration-300">
                    <a href="">CS:GO</a>
                </li>
            </ul>
        </div>

        <div className="container mx-auto px-4 py-8">
            <h3 className="text-accent-pink-500 text-2xl font-bold mb-5">All gaming news</h3>
            <Posts />
        </div>
    </div>
  );
}

export default Home;

