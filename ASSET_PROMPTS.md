# 실사 착장 이미지

생성 방식: 내장 `image_gen` 도구. CLI/API fallback을 사용하지 않았습니다. 생성 결과를 확인한 뒤 원본을 유지하고 프로젝트에 복사했습니다.

## 여성 기본 모델

파일: `dress-code-studio/assets/model-female-v1.png`

```text
Create a premium realistic fashion ecommerce full-length studio photograph, vertical 2:3 frame. ONE adult Korean woman age about 28, natural attractive face and realistic anatomy, long dark brown hair, standing relaxed face forward with hands at sides, full head and both shoes entirely visible with generous 8 percent margins. Outfit EXACTLY an ivory plain button-front collared cotton shirt underneath an OPEN greige cable-knit cardigan (real cable knitted texture and button placket), charcoal taupe wide tailored trousers, burgundy Mary Jane flat shoes with strap, subtle pearl stud earrings. No bag. Seamless warm light beige studio background, soft diffused window lighting, natural skin texture, real cloth texture, high-end understated editorial photography. No drawing, illustration, CGI, cartoon, mannequin, typography, text, watermark, collages or side panels. The body and clothing should occupy 82% of image height. This is a production fashion website model preview.
```

## 남성 기본 모델

파일: `dress-code-studio/assets/model-male-v1.png`

```text
Create a premium realistic fashion ecommerce full-length studio photograph, vertical 2:3 frame. ONE adult Korean man age about 28, natural handsome face and realistic anatomy, short dark slightly textured hair, standing relaxed face forward with hands at sides, full head and both shoes entirely visible with generous 8 percent margins. Outfit EXACTLY an ivory plain button-front collared cotton shirt underneath an OPEN greige cable-knit cardigan (real cable knitted texture and button placket), charcoal taupe wide tailored trousers, dark brown leather loafers, understated brown leather wristwatch. No bag. Seamless warm light beige studio background, soft diffused window lighting, natural skin texture, real cloth texture, high-end understated editorial photography. No drawing, illustration, CGI, cartoon, mannequin, typography, text, watermark, collages or side panels. The body and clothing should occupy 82% of image height. This is a production fashion website model preview.
```

## 의상 사진 아틀라스

파일: `dress-code-studio/assets/wardrobe-photo-atlas-v1.png`

8열 × 5행, 총 40개 사진. `아우터 없이`는 사진 없는 별도 옵션입니다. `real-outfits.js`의 `slots` 배열이 왼쪽 위부터 행 순서로 각 의상 ID에 대응합니다.

```text
Create ONE perfectly regular fashion product photographic sprite atlas, landscape image, EXACTLY EIGHT COLUMNS and FIVE ROWS = FORTY equal-sized cells. No grid lines, no writing, no labels, no text. All cells same warm off-white background. Each cell contains exactly one independently photographed garment or accessory, fully visible, centered with 12% empty margin, realistic clothing flat-lay ecommerce product photo with natural textile texture, subtle soft shadow, no people, no hangers. Read these items in strict ROW-MAJOR ORDER from top left to bottom right: ROW1: taupe plain short-sleeve cotton tee; ivory plain collared cotton shirt; taupe crew-neck knit sweater; ivory silk blouse with bow neck; navy short-sleeve knit polo; black long-sleeve turtleneck; ivory cable-knit sweater; gray oversized hoodie with hood and kangaroo pocket. ROW2: charcoal sleeveless knit tank; ivory button-front knitted top; navy oversized crew-neck sweatshirt; pale blue vertical striped collared shirt; dark indigo straight jeans; taupe wide tailored trousers; burgundy pleated midi skirt; chocolate brown pleated long skirt. ROW3: black wide cargo trousers with patch pockets; charcoal wide jeans; black pleated mini skirt; cream wide-leg trousers; navy flared midi skirt; charcoal tailored blazer; greige cable-knit cardigan; charcoal sleeveless V-neck sweater vest. ROW4: plum purple fuzzy cardigan; dark brown leather biker jacket; navy buckle pinafore midi dress; off-white low-top sneakers pair; dark brown leather loafers pair; burgundy Mary Jane flats pair; dark brown ankle boots pair; black leather derby shoes pair. ROW5: black knee-high boots pair; pearl stud earrings pair; dark brown leather shoulder tote bag; brown leather wristwatch; gold hoop earrings and delicate necklace as one jewelry set; taupe patterned silk scarf; silver chain necklace; slim black necktie. Keep the cell boundaries and equal spacing mathematically precise. Photoreal product photography, not illustrations. Every item must be distinct and accurate to the described silhouette and color. No additional items or borders.
```

임의 조합의 런타임 생성 프롬프트는 `api/render-outfit.js`의 `buildPhotoPrompt()`에 있습니다. 사진 생성 API 인증 키는 원본 이미지 생성과 별개로 설정해야 합니다.
