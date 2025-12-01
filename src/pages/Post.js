import {Link} from "react-router-dom";
import { Title, Text, Image, Ad } from '../components/Editor';
import RelatedPosts from "../components/RelatedPosts";


function Post() {
  return (
    <div className="pt-[200px] p-4 container mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-white">This is a really long title for a post that'll break to two lines</h1>

        <hr className="border-t border-t-gray-60 mb-4"/>

        <div className="text-gray-400 flex-wrap mb-5 lg:mb-0 flex justify-between">
            <div>
                Posted by <Link to="/profile" className="w-full ">Roisin</Link> on Nov 26 2025 at 4:48PM PST
            </div>

            <div>
                <button className=" flex gap-2 items-center text-white">
                    <svg className="w-5" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M192,24H96A16,16,0,0,0,80,40V56H64A16,16,0,0,0,48,72V224a8,8,0,0,0,12.65,6.51L112,193.83l51.36,36.68A8,8,0,0,0,176,224V184.69l19.35,13.82A8,8,0,0,0,208,192V40A16,16,0,0,0,192,24ZM160,208.46l-43.36-31a8,8,0,0,0-9.3,0L64,208.45V72h96Zm32-32L176,165V72a16,16,0,0,0-16-16H96V40h96Z"></path></svg>
                    <span className="cta">Save this post</span>
                </button>
            </div>
        </div>

        <div>
            <div className="grid gap-5 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <Title level={1}>Main Heading</Title>
                    <Text>This is a paragraph of text.</Text>
                    <Image url="https://example.com/image.jpg" alt="Description" />
                    <Ad clientId="ca-pub-xxxxx" slot="1234567890" />
                </div>

                <div className="lg:col-span-2">
                    <RelatedPosts/>
                </div>
            </div>
        </div>

    </div>
  );
}

export default Post;

