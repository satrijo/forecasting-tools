/**
 * - https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=pwxDarat
 * - https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=lokasiCuaca&lon=109.11552349560588&lat=-7.656747622457885
 * - https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=getForecastDarat&code=202512111800.json
 * - https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=getManifest&code=jalurDarat
 * - https://www.bmkg.go.id/alerts/nowcast/id/CJH20251210002_alert.xml
 * - https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=nowcasting&code=CJH
 */

import { file } from "bun";
import { XMLParser } from "fast-xml-parser";

class PublicWeather {
  private xmlParser: XMLParser;

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
  }

  getPwxDarat() {
    const url =
      "https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=pwxDarat";
    return fetch(url).then((res) => res.json());
  }

  getLocationWeather(lat: number, lon: number) {
    const url = `https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=lokasiCuaca&lon=${lon}&lat=${lat}`;
    return fetch(url).then((res) => res.json());
  }

  getForecastDarat(code: string) {
    const url = `https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=getForecastDarat&code=${code}.json`;
    return fetch(url).then((res) => res.json());
  }

  getManifest() {
    const url = `https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=getManifest&code=jalurDarat`;
    return fetch(url).then((res) => res.json());
  }

  getNowcasting(code: string) {
    const url = `https://signature.bmkg.go.id/dwt/asset/boot/api_dwt2.php?type=nowcasting&code=${code}`;
    return fetch(url).then((res) => res.json());
  }

  async getNowcastingXMLLatest(provinceName?: string) {
    const url = `https://www.bmkg.go.id/alerts/nowcast/id`;
    const xmlString = await fetch(url).then((res) => res.text());
    const data = this.xmlParser.parse(xmlString);

    if (provinceName) {
      return this.filterByProvince(data, provinceName);
    }

    return data;
  }

  filterByProvince(data: any, provinceName: string) {
    if (!data || !data.rss || !data.rss.channel || !data.rss.channel.item) {
      return null;
    }

    const items = data.rss.channel.item;
    if (!Array.isArray(items)) {
      return null;
    }

    // Filter by title containing province name (case-insensitive)
    const provinceKeyword = provinceName.toLowerCase();
    const filtered = items.filter((item: any) => {
      if (!item.title) return false;
      const title = item.title.toLowerCase();
      return title.includes(provinceKeyword);
    });

    return {
      nowcasting: filtered,
    };
  }

  async getNowcastingXML(url: string) {
    const xmlString = await fetch(url).then((res) => res.text());
    return this.xmlParser.parse(xmlString);
  }
}

export { PublicWeather };
