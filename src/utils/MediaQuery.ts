import media from '@/styles/media.json';

export class MediaQueryManager {
  mediaQueries: Record<string, string> = {};
  #breakpoints: { sm: number; md: number; lg: number } = { sm: 0, md: 0, lg: 0 };

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  constructor(json: any) {
    this.mediaQueries = json['custom-media'];
    this.#breakpoints = json.breakpoints;
  }

  private isSmallerOrEqualTo(value: number): boolean {
    return document.body.clientWidth <= value;
  }

  private isGreaterThan(value: number): boolean {
    return document.body.clientWidth > value;
  }

  get isMobile(): boolean {
    return this.lowerThanMd;
  }

  get lowerThanSm(): boolean {
    return this.isSmallerOrEqualTo(this.#breakpoints.sm);
  }
  get lowerThanMd(): boolean {
    return this.isSmallerOrEqualTo(this.#breakpoints.md);
  }

  get betweenSmAndMd(): boolean {
    return this.isGreaterThan(this.#breakpoints.sm) && this.isSmallerOrEqualTo(this.#breakpoints.md);
  }

  get isGreaterThanMd(): boolean {
    return this.isGreaterThan(this.#breakpoints.md);
  }

  getQuery(media: string): string {
    return this.mediaQueries['--' + media];
  }
}

export const mq = new MediaQueryManager(media);
