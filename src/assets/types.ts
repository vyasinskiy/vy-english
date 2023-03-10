export interface Word {
	'Search language': string;
	'Translation language': string;
	'Search text': string;
	'Translation text': string;
	'Tags / Comments': string;
	'Search example': string;
	'Translation example': string;
	'Source text': string;
	'Document / URL': string;
}

export type RusKey = Word['Translation text'];
export type EngKey = Word['Search text'];

export interface MapRusKeyToEngKeys {
	[key: RusKey]: EngKey[];
}

export interface SynonymData {
	engKey: string;
	engContext: string;
	rusContext: string;
}

export interface MapRusKeyToSynonyms {
	[key: RusKey]: SynonymData[];
}

export enum Mode {
	Favorite = 'favorite',
	Ordinary = 'ordinary',
	Advanced = 'advanced',
}
