import type { SVGProps } from "react";

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props} />
  );
}

export const Icons = {
  home: (props: SVGProps<SVGSVGElement>) => (
    <Icon {...props}>
      <path d="M4 11.5 12 5l8 6.5" />
      <path d="M6.5 10.5V19h11v-8.5" />
    </Icon>
  ),
  search: (props: SVGProps<SVGSVGElement>) => (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </Icon>
  ),
  plans: (props: SVGProps<SVGSVGElement>) => (
    <Icon {...props}>
      <path d="M8 4v3M16 4v3M5 8h14M6.5 6.5h11A1.5 1.5 0 0 1 19 8v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19V8a1.5 1.5 0 0 1 1.5-1.5Z" />
    </Icon>
  ),
  ticket: (props: SVGProps<SVGSVGElement>) => (
    <Icon {...props}>
      <path d="M4 9.5V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.5a2 2 0 0 0 0 5V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5a2 2 0 0 0 0-5Z" />
    </Icon>
  ),
  karma: (props: SVGProps<SVGSVGElement>) => (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 1 6.3 12.9L12 12V4Z" />
    </Icon>
  ),
  play: (props: SVGProps<SVGSVGElement>) => (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="m10 9 6 3-6 3V9Z" />
    </Icon>
  ),
  heart: (props: SVGProps<SVGSVGElement>) => (
    <Icon {...props}>
      <path d="M12 19s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 2.8C19 14.6 12 19 12 19Z" />
    </Icon>
  ),
  circles: (props: SVGProps<SVGSVGElement>) => (
    <Icon {...props}>
      <circle cx="8" cy="10" r="3" />
      <circle cx="16" cy="10" r="3" />
      <circle cx="12" cy="16" r="3" />
    </Icon>
  ),
  profile: (props: SVGProps<SVGSVGElement>) => (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </Icon>
  ),
  arrow: (props: SVGProps<SVGSVGElement>) => (
    <Icon {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  ),
  mic: (props: SVGProps<SVGSVGElement>) => (
    <Icon {...props}>
      <rect x="9" y="4" width="6" height="10" rx="3" />
      <path d="M6.5 11a5.5 5.5 0 0 0 11 0M12 16.5V20" />
    </Icon>
  ),
  spark: (props: SVGProps<SVGSVGElement>) => (
    <Icon {...props}>
      <path d="M12 3.5 13.6 9 19 10.5 13.6 12 12 17.5 10.4 12 5 10.5 10.4 9 12 3.5Z" />
    </Icon>
  ),
  bell: (props: SVGProps<SVGSVGElement>) => (
    <Icon {...props}>
      <path d="M6 16h12l-1.2-2.1V10a4.8 4.8 0 0 0-9.6 0v3.9L6 16Z" />
      <path d="M10 18.2a2 2 0 0 0 4 0" />
    </Icon>
  ),
  share: (props: SVGProps<SVGSVGElement>) => (
    <Icon {...props}>
      <circle cx="6" cy="12" r="2" />
      <circle cx="18" cy="7" r="2" />
      <circle cx="18" cy="17" r="2" />
      <path d="m8 11 8-3.5M8 13l8 3.5" />
    </Icon>
  ),
  close: (props: SVGProps<SVGSVGElement>) => (
    <Icon {...props}>
      <path d="m7 7 10 10M17 7 7 17" />
    </Icon>
  ),
};
