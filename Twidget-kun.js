// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: desktop;
/* 
 * Twidget-kun.js
 * Author: Kynako
 * dependencies:
   - Twista.js
     - Twista.js is wrriten by Kynako.
     - license: https://guthub.com/Kynako/Twista-js/blob/main/LICENSE
   - cache.js
     - cache.js is wrritem by EvanDColeman.
     - license: https://github.com/evandcoleman/scriptable/blob/main/LICENSE
 */
/* Environmental variables */
const ENV = {
  CK: '__consumer_key__',
  CS: '__consumer_secret_key__',
  AT: '__access_token__',
  AS: '__access_token_secret__'
};

// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: cube;
/*!
 * Ginit.js
 *
 * Copyright (c) 2021 Kynako
 *
 * This software is released under the MIT license.
 * https://github.com/Kynako/Ginit/blob/main/LICENSE
*/
class Ginit {
  constructor(){
    this.fm = FileManager.iCloud();
    this.base = 'https://raw.githubusercontent.com/'
  };
  
  async set(list, parent, hierarky=0){
    let tab = '  '.repeat(hierarky)
    for(let data of list){
      if(typeof data === 'object'){
        console.warn(`${tab}${data.dir}`)
        let familly = parent + data.dir;
        if(!this.fm.fileExists(familly)){
          fm.createDirectory(familly, false);
        };
        await this.set(
          data.list,
          parent + data.dir,
          hierarky + 1
        );
      } else if(typeof data === 'string'){
        console.warn(`${tab}${data}`)
        let fileName = this.fm.fileName(data, true);
        let filePath = parent + fileName;
        if(!this.fm.fileExists(filePath)){
          console.log(`${tab}NOT EXISTS`);
          await this._load(data, parent, tab);
        };
        console.log(`${tab}EXISTS`);
      } else {
        console.error('Error');
      };
    }
  };
  
  async _load(data, parent, tab){
    try {
      let url = this.base + data;
      console.log(`${tab}url: ${url}`)
      let r = new Request(url);
      let res = await r.load();
      if(r.response.statusCode >= 400){
        throw this._pj(r.response);
      }
      let fileName = this.fm.fileName(data, true);
      console.log(`${tab}${parent+fileName}`);
      this.fm.write(parent+fileName, res)
    } catch (e) {
      console.error(e)
    }
      
  };
  
  _pj(value){
    return JSON.stringify(value, null, 2);
  }
};

// =================================================

const repo = 'Kynako/Twidget-kun/main/';
const list = [
  `${repo}Twidget-kun.js`,
  {
    dir: 'Twidget-kun/',
    list: [  
      {
        dir: 'modules/',
        list: [
          `${repo}modules/cache.js`,
          `${repo}modules/Twista.js`,
          `${repo}modules/crypto-js.min.js`
        ]
      },
      {
        dir: 'caches/',
        list: []
      }
    ]
  }
];

// ==================================================
const fm = FileManager.iCloud();
const dirPath = fm.joinPath(
  fm.documentsDirectory(), 'Twidget-kun/'
);
if(!fm.fileExists(dirPath)){
  fm.createDirectory(dirPath, false);
  await saveEnv()
};
const ginit = new Ginit();
await ginit.set(list, fm.documentsDirectory()+'/')
// ==================================================
const CONFIG = {
  screen_name: args.widgetParameter || 'Twitter',
};
const isUDA = Device.isUsingDarkAppearance()
const COLOR = {
  black: new Color('14171A'),
  blue: new Color('1DA1F2'),
  darkgray: new Color('657786'),
  lightgray: new Color('AAB8C2'),
  e1_lightgray: new Color('E1E8ED'),
  e2_lightgray: new Color('F5F8FA'),
  white: new Color('F5F8FA')
};
const DARKCOLOR = {
  blue: COLOR.blue,
  bg: COLOR.black,
  text: COLOR.white,
  subtext: COLOR.darkgray
};
const LIGHTCOLOR = {
  blue: COLOR.blue,
  bg: COLOR.white,
  text: COLOR.black,
  subtext: COLOR.darkgray
};
const APPEARANCE = isUDA ? DARKCOLOR : LIGHTCOLOR;
// ==================================================
console.json = (value) => {
  console.log(JSON.stringify(value, null, 2))
}

const CryptoJS = importModule('modules/crypto-js.min')
const Twista = importModule('Twidget-kun/modules/Twista')
const tw = new Twista(
  ENV, 
  function(base, key){
    return CryptoJS.enc.Base64.stringify(
      CryptoJS.HmacSHA1(base, key)
    );
  }
);
// ==================================
const Cache = importModule('Twidget-kun/modules/cache')
const cache = new Cache(`Twidget-kun/caches` );
const DATA = await getUserData('Twidget-kun', 30)
console.json(DATA.json);

async function getUserData(name, expirationMinutes){
  let cacheKey = CONFIG.screen_name
  let cachedUserData = await cache.read(
    cacheKey, expirationMinutes
  )
  if(cachedUserData == null || cachedUserData.json.screen_name != CONFIG.screen_name){
    // hasn't existed yet
    console.log('Loading user data...')
    let res = await tw.requestJson(
      'GET',
      'users/show.json',
      {screen_name: CONFIG.screen_name}
    )
    cache.write(cacheKey, res)
    return res
  } else {
    // has existed
    console.log('Using user cache...')
    return cachedUserData
  };
};

// ===================================================
await getBackgroundImageAtBannerUrl(DATA.json.profile_banner_url)

let widget = null
if (config.runsInWidget) {
  widget = await createMediumWidget(DATA.json)
  Script.setWidget(widget)
  Script.complete()
} else if (config.runsWithSiri) {
    widget = await createWidget(USER);
    await widget.presentMedium();
    Script.complete()
} else {
  presentMenu(widget)
};

async function presentMenu(widget) {
  let alert = new Alert()
  alert.title = 'Twidget-kun v1';
  alert.addAction('Show USER Data');
  alert.addAction('View Widget');
  alert.addCancelAction("Cancel");
  let idx = await alert.presentSheet();
  switch(idx) {
    case 0: QuickLook.present(DATA); break;
    case 1: {
      let widget = await createMediumWidget(DATA.json);
      await widget.presentMedium()
      break;
    };
  };
};

// ===========================================
async function createMediumWidget(USER){
  const w = new ListWidget();
  w.backgroundColor = Color.orange()

  const entireSt = w.addStack();
  entireSt.size = new Size(329, 155);
  entireSt.layoutVertically();
  
  // w - entire -  up
  const upSt = entireSt.addStack();
  upSt.backgroundColor = APPEARANCE.bg;
  upSt.size = new Size(329, 155/2*1-0.5)
  upSt.layoutHorizontally();
  
  const iconSt = upSt.addStack();
  iconSt.backgroundColor = APPEARANCE.bg;
  const icon = await getIconAtUrl(USER.profile_image_url);
  iconSt.size = new Size(
    upSt.size.height, upSt.size.height
  );
  iconSt.setPadding(10, 10, 10, 10);

  const iconImg = iconSt.addImage(icon);
  
  // w - up - userName
  const userNameSt = upSt.addStack();
  userNameSt.setPadding(20, 5, 5, 5)
  userNameSt.layoutVertically()
  userNameSt.backgroundColor = APPEARANCE.bg
  userNameSt.size = new Size(
    329-iconSt.size.width, upSt.size.height
  );
  
  const nameSt = userNameSt.addStack();
  nameSt.layoutHorizontally()
  name = nameSt.addText(USER.name)
  name.font = Font.boldSystemFont(24);
  name.textColor = APPEARANCE.text
  
  const screenNameSt = userNameSt.addStack();
  screenName = screenNameSt.addText('@'+USER.screen_name);
  screenName.font = Font.systemFont(18);
  screenName.textColor = APPEARANCE.subtext
  screenNameSt.addSpacer()
  userNameSt.addSpacer()
  
  // w - entire - entireSeparator
  const entireSeparatorSt = entireSt.addStack()
  entireSeparatorSt.size = new Size(329, 1);
  entireSeparatorSt.backgroundColor = APPEARANCE.blue
  
  // w - extire - down
  const downSt = entireSt.addStack();
  downSt.layoutHorizontally();
  downSt.size = new Size(
    329, 155-upSt.size.height
  );
  downSt.backgroundColor = APPEARANCE.bg
  
  const lInfoSt = downSt.addStack();
  lInfoSt.layoutVertically()
  lInfoSt.setPadding(10, 15, 10, 10)
  lInfoSt.backgroundColor = APPEARANCE.bg
  lInfoSt.size = new Size(
    329/2-1, 155-upSt.size.height
  );
  const lItems = [
    [USER.followers_count, 'Followers'],
    [USER.friends_count, 'Following'],

  ];
  addInfo(lInfoSt, lItems)
  
  const separatorSt = downSt.addStack();
  separatorSt.backgroundColor = APPEARANCE.blue
  separatorSt.size = new Size(
    1, 155-upSt.size.height
  );
  
  const rInfoSt = downSt.addStack();
  rInfoSt.layoutVertically();
  rInfoSt.setPadding(10, 15, 10, 10);
  rInfoSt.backgroundColor = APPEARANCE.bg
  rInfoSt.size = new Size(
    329/2, 155-upSt.size.height
  );
  const rItems = [
    [USER.statuses_count, 'Tweets'],
    [USER.favourites_count, 'Favorites']
  ];
  addInfo(rInfoSt, rItems)
  
  return w;
};

async function getIconAtUrl(imageUrl){
  const toUseUrl = imageUrl.replace(/_normal/, '')
  const r = new Request(toUseUrl);
  const icon = await r.loadImage();
  const dc = new DrawContext();
  const width  = icon.size.width,
        height = icon.size.height
  dc.size = icon.size;
  dc.opaque = true
  // draw icon
  dc.drawImageAtPoint(icon, new Point(0, 0))
  // draw mask
  dc.setStrokeColor(APPEARANCE.bg)
  let outline_width = Math.sqrt(2)*(width-1)/2
  dc.setLineWidth(outline_width)
  dc.strokeEllipse(
    new Rect(
      0-outline_width/2, 0-outline_width/2, width+outline_width, width+outline_width
  ))
  return dc.getImage();
};

async function getBackgroundImageAtBannerUrl(imageUrl){
  const r = new Request(imageUrl);
  const bannerImg = await r.loadImage();
//   QuickLook.present(bannerImg, false);
  return bannerImg
}

function addInfo(stack, itemArray){
  for(let item of itemArray){
    let itemSt = stack.addStack();
    itemSt.layoutHorizontally()
    // count
    let countSt = itemSt.addStack();
    countSt.layoutVertically()
    let count = countSt.addText(item[0].toString());
    count.font = Font.systemFont(16);
    count.textColor = APPEARANCE.text;
    // unit
    let unitSt = itemSt.addStack();
    unitSt.layoutVertically()
    unitSt.addSpacer(16-13)
    let unit = unitSt.addText(' '+item[1].toString());
    unit.font = Font.systemFont(13)
    unit.textColor = APPEARANCE.subtext;
  };
};