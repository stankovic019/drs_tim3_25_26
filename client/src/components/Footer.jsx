import logo from "/logo-large.png";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 border-t-2 border-[#353a7c] shadow-[0_-5px_#353a7c] bg-[linear-gradient(45deg,#353a7c,#2872CB)] p-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">
        <div className="text-white font-semibold text-sm text-center md:text-right">
          <div>Maja Bogićević</div>
          <div>Nikola Knežević</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-white font-extrabold text-sm mb-2">
            © Copyright
          </div>
          <img
            src={logo}
            alt="Logo"
            className="h-11 w-auto object-contain"
          />
        </div>
        <div className="text-white font-semibold text-sm text-center md:text-left">
          <div>Dimitrije Stanković</div>
          <div>Vojin Jovanović</div>
        </div>
      </div>
    </footer>
  );
}
