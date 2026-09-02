export function Drip({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none relative w-full ${className}`}
    >
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className="block h-[52px] w-full sm:h-[70px]"
      >
        <path
          fill="currentColor"
          d="M0 0h1440v22c-26 0-33 10-33 24s-9 22-22 22-21-8-21-22-8-24-30-24-30 8-30 26-10 30-24 30-24-12-24-30-6-26-26-26-27 6-27 20-8 20-19 20-18-6-18-20-8-20-28-20-30 10-30 28-12 32-27 32-26-14-26-32-6-28-28-28-28 8-28 22-9 22-20 22-20-8-20-22-8-22-30-22-30 12-30 30-11 28-25 28-24-10-24-28-7-30-30-30-29 10-29 24-9 22-20 22-19-8-19-22-9-24-31-24-30 10-30 26-10 28-24 28-24-12-24-28-7-26-28-26-29 8-29 22-9 22-20 22-19-8-19-22-9-22-31-22-30 10-30 26-11 30-25 30-24-14-24-30-7-26-29-26-29 8-29 22-9 22-20 22-19-8-19-22-9-22-30-22V0Z"
        />
      </svg>

      <span className="anim-gotear absolute left-[18%] top-[52px] block size-3 rounded-full bg-current sm:top-[70px]" />
      <span
        className="anim-gotear absolute left-[47%] top-[58px] block size-2 rounded-full bg-current sm:top-[78px]"
        style={{ animationDelay: "1.2s" }}
      />
      <span
        className="anim-gotear absolute left-[76%] top-[54px] block size-2.5 rounded-full bg-current sm:top-[72px]"
        style={{ animationDelay: "2.1s" }}
      />
    </div>
  );
}
