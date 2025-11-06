import Link from "next/link";
import { MessageCircle, User } from "lucide-react";

type Props = {
  isAuthPage: boolean;
  isLoggedIn: boolean;
  hideElement?: boolean;
  displayElement?: boolean;
  mounted: boolean;
  setShowMenu: (show: boolean) => void;
}

export default function NavButton({
  isAuthPage,
  isLoggedIn,
  hideElement,
  displayElement,
  mounted,
  setShowMenu,
}: Props) {
  const commonClasses = `flex items-center text-[var(--text-color)]
    relative hover:cursor-pointer group duration-300 ease
    ${hideElement ? "hidden md:block" : ""}
    ${displayElement ? "opacity-100" : "opacity-0 md:opacity-100"}
    ${!mounted ? "hidden" : ""}`;

  const textClasses = `md:duration-400 text-start text-xl w-36 mx-4 md:origin-left
    ${hideElement ? "hidden" : ""}
    ${displayElement ? "md:opacity-100" : "md:opacity-0 md:scale-x-0 md:mr-0"}`;

  const handleClick = () => {
    if (window.innerWidth < 768) setShowMenu(false);
  };

  return (
    <>
      {isAuthPage && (
        <Link
          href="/"
          prefetch={true}
          onClick={handleClick}
          className={commonClasses}
        >
          <MessageCircle
            size={40}
            className="duration-150 group-hover:scale-115 active:scale-90"
          />
          <p className={textClasses}>Back to chat</p>
        </Link>
      )}

      {!isAuthPage && isLoggedIn && (
        <Link
          href="/user"
          prefetch={true}
          onClick={handleClick}
          className={commonClasses}
        >
          <User
            size={40}
            className="duration-150 group-hover:scale-115 active:scale-90"
          />
          <p className={textClasses}>User profile</p>
        </Link>
      )}

      {!isAuthPage && !isLoggedIn && (
        <Link
          href="/auth/login"
          prefetch={true}
          onClick={handleClick}
          className={commonClasses}
        >
          <User
            size={40}
            className="duration-150 group-hover:scale-115 active:scale-90"
          />
          <p className={textClasses}>Login</p>
        </Link>
      )}
    </>
  );
}
