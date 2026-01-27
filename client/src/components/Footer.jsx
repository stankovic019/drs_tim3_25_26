import logo from "/logo-large.png";

export default function Footer() {
  return (
    <footer className="static w-full rounded-lg shadow-2xl bg-[linear-gradient(45deg,#353a7c,#2872CB)]">
      <div className="w-full max-w-screen-xl mx-auto p-1.5 md:py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="text-[15px] font-semibold text-white sm:w-1/3 sm:text-left">
            Copyright © 2026
          </div>
          <div className="flex items-center justify-center sm:w-1/3">
            <img src={logo} alt="Logo" className="w-[95px]" />
          </div>
          <div className="text-[13px] font-semibold text-white sm:w-1/3 sm:text-right">
            Maja Bogićević, Nikola Knežević, Dimitrije Stanković, Vojin
            Jovanović
          </div>
        </div>
      </div>
    </footer>
  );
}
