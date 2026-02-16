import { Link } from "react-router-dom";
import { FaYoutube } from "react-icons/fa";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";

import Image from "../Image";
import { IMovie } from "@/types";
import { useMediaQuery } from "usehooks-ts";
import { useWatchlist } from "@/context/watchlistContext";
import { cn } from "@/utils/helper";

const MovieCard = ({
  movie,
  category,
}: {
  movie: IMovie;
  category: string;
}) => {
  const { poster_path, original_title: title, name, id } = movie;
  const isMobile = useMediaQuery("(max-width: 380px)");
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const saved = isInWatchlist(String(id));

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeFromWatchlist(String(id));
    } else {
      addToWatchlist({ ...movie, category });
    }
  };

  return (
    <>
      <div className="relative group w-[170px] xs:h-[250px] h-[216px]">
        <Link
          to={`/${category}/${id}`}
          className="dark:bg-[#1f1f1f] bg-[#f5f5f5] rounded-lg block w-full h-full select-none overflow-hidden"
        >
          <Image
            height={!isMobile ? 250 : 216}
            width={170}
            src={`https://image.tmdb.org/t/p/original/${poster_path}`}
            alt={movie.original_title}
            className=" object-cover rounded-lg drop-shadow-md shadow-md group-hover:shadow-none group-hover:drop-shadow-none transition-all duration-300 ease-in-out"
            effect="zoomIn"
          />

          <div className="absolute top-0 left-0 w-[170px]  h-full group-hover:opacity-100 opacity-0 bg-[rgba(0,0,0,0.6)] transition-all duration-300 rounded-lg flex items-center justify-center pointer-events-none">
            <div className="xs:text-[48px] text-[42px] text-[#ff0000] scale-[0.4] group-hover:scale-100 transition-all duration-300 ">
              <FaYoutube />
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleToggleWatchlist}
          className={cn("absolute top-2 right-2 z-[3] text-white text-lg p-1 rounded-full bg-black/50 transition-all duration-300 hover:scale-110", saved ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
        >
          {saved ? <BsBookmarkFill className="text-yellow-400" /> : <BsBookmark />}
        </button>
      </div>

      <h4 className="dark:text-gray-300 text-center cursor-default sm:text-base xs:text-[14.75px] text-[14px] font-medium ">
        {(title?.length > 50 ? title.split(":")[0] : title) || name}
      </h4>
    </>
  );
};

export default MovieCard
