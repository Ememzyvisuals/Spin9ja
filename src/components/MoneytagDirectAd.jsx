import React from "react";

const MonetagDirectAd = () => {
  const handleOpenAd = () => {
    window.open("https://omg10.com/4/10701348", "_blank");
  };

  return (
    <div className="my-4 text-center">
      <button
        onClick={handleOpenAd}
        className="px-6 py-3 bg-yellow-500 text-black rounded-lg shadow-lg hover:bg-yellow-600 transition duration-300"
      >
        Claim Bonus Spin
      </button>
    </div>
  );
};

export default MonetagDirectAd;