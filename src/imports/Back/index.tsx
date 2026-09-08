import svgPaths from "./svg-uqj2v8ktcl";

function Group() {
  return (
    <div className="absolute h-[275px] left-[15px] mix-blend-color-burn top-[15px] w-[138px]">
      <div className="absolute inset-[-0.36%_-0.72%]">
        <svg className="block size-full" fill="none" height="277" preserveAspectRatio="none" viewBox="0 0 140 277" width="140">
          <g id="Group 48" style={{ mixBlendMode: "color-burn" }}>
            <g filter="url(#filter0_g_0_4)" id="Rectangle 42 (Stroke)">
              <path d={svgPaths.p304c4300} fill="#8A7057" fillOpacity="0.5" />
            </g>
            <g filter="url(#filter1_g_0_4)" id="Union (Stroke)">
              <path d={svgPaths.pc049180} fill="#8A7057" fillOpacity="0.5" />
            </g>
            <g filter="url(#filter2_g_0_4)" id="?">
              <path d={svgPaths.p862d700} fill="#8A7057" fillOpacity="0.5" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="277" id="filter0_g_0_4" width="140" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feTurbulence baseFrequency="0.14705881476402283 0.14705881476402283" numOctaves="3" seed="5466" type="fractalNoise" />
              <feDisplacementMap height="100%" in="shape" result="displacedImage" scale="2" width="100%" xChannelSelector="R" yChannelSelector="G" />
              <feMerge result="effect1_texture_0_4">
                <feMergeNode in="displacedImage" />
              </feMerge>
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="161" id="filter1_g_0_4" width="100.024" x="20.2627" y="58.1016">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feTurbulence baseFrequency="0.14705881476402283 0.14705881476402283" numOctaves="3" seed="5466" type="fractalNoise" />
              <feDisplacementMap height="100%" in="shape" result="displacedImage" scale="2" width="100%" xChannelSelector="R" yChannelSelector="G" />
              <feMerge result="effect1_texture_0_4">
                <feMergeNode in="displacedImage" />
              </feMerge>
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="59" id="filter2_g_0_4" width="38" x="51.165" y="109.822">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feTurbulence baseFrequency="0.14705881476402283 0.14705881476402283" numOctaves="3" seed="5466" type="fractalNoise" />
              <feDisplacementMap height="100%" in="shape" result="displacedImage" scale="2" width="100%" xChannelSelector="R" yChannelSelector="G" />
              <feMerge result="effect1_texture_0_4">
                <feMergeNode in="displacedImage" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export default function Back() {
  return (
    <div className="bg-[#7e9e46] overflow-clip relative rounded-[8px] size-full" data-name="Back">
      <Group />
    </div>
  );
}