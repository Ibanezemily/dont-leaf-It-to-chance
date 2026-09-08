import svgPaths from "./svg-d7ctobszwm";

export default function Group() {
  return (
    <div className="relative size-full">
      <svg className="absolute block inset-0 size-full" fill="none" height="11.5223" preserveAspectRatio="none" viewBox="0 0 13.635 11.5223" width="13.635">
        <g id="Group 77">
          <g filter="url(#filter0_gn_0_4)" id="Group 23">
            <path d={svgPaths.p3b55e00} fill="#AECD55" id="Ellipse 44" />
            <path d={svgPaths.p12b79700} fill="#6D8A1C" id="Line 2 (Stroke)" />
          </g>
          <path d={svgPaths.p3ed3f900} fill="#4B4B4B" id="3" />
        </g>
        <defs>
          <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="11.2402" id="filter0_gn_0_4" width="6.43436" x="6.77886" y="0.141326">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
            <feTurbulence baseFrequency="0.99900001287460327 0.99900001287460327" numOctaves="3" seed="5466" type="fractalNoise" />
            <feDisplacementMap height="100%" in="shape" result="displacedImage" scale="0.30800482630729675" width="100%" xChannelSelector="R" yChannelSelector="G" />
            <feMerge result="effect1_texture_0_4">
              <feMergeNode in="displacedImage" />
            </feMerge>
            <feTurbulence baseFrequency="4.870053768157959 4.870053768157959" numOctaves="3" result="noise" seed="3473" stitchTiles="stitch" type="fractalNoise" />
            <feColorMatrix in="noise" result="alphaNoise" type="luminanceToAlpha" />
            <feComponentTransfer in="alphaNoise" result="coloredNoise1">
              <feFuncA tableValues="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 " type="discrete" />
            </feComponentTransfer>
            <feComposite in="coloredNoise1" in2="effect1_texture_0_4" operator="in" result="noise1Clipped" />
            <feFlood floodColor="#FFFFFF" result="color1Flood" />
            <feComposite in="color1Flood" in2="noise1Clipped" operator="in" result="color1" />
            <feMerge result="effect2_noise_0_4">
              <feMergeNode in="effect1_texture_0_4" />
              <feMergeNode in="color1" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}