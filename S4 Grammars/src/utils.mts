import * as NE from '@nianyi-wang/element';

export function WaitUntil(fn: () => boolean) {
	return new Promise<void>(res => {
		const timerId = setInterval(() => {
			if(!fn())
				return;
			clearInterval(timerId);
			res();
		});
	});
}

export function WaitForSeconds(seconds: number = 1) {
	let done = false;
	setTimeout(() => { done = true; }, seconds * 1e3);
	return WaitUntil(() => done);
}

type ExtraAttributes = {
	[key: string]: string | number;
};

export function CreateInput(label: string, onChanged: (value: string) => void, attributes: ExtraAttributes = {}): HTMLElement {
	return NE.Create('p', {
		children: [
			NE.Create('span', {
				text: `${label}: `,
			}),
			NE.Create('input', {
				attributes: Object.fromEntries(Object.entries(attributes).map(([k, v]) => [k, v + ''])),
				on: {
					input() {
						onChanged(this.value);
					},
				}
			}),
		],
	});
}

export function CreateInputEx<P extends string>(
	label: string,
	target: { [key in P]: string | number; },
	propertyName: P,
	type: 'number' | 'string',
	attributes: ExtraAttributes = {},
) {
	attributes['value'] = target[propertyName];
	// if(type === 'number' && ['min', 'max'].every(k => k in attributes))
	// 	attributes['type'] = 'range';
	return CreateInput(
		label,
		val => {
			switch(type) {
				case 'string':
					target[propertyName] = val;
					break;
				case 'number':
					target[propertyName] = +val;
			}
		},
		attributes,
	);
}