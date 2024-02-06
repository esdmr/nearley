export function string(d: readonly unknown[]) {
	return d.join('');
}

export function array<T>([head, tail]: readonly [readonly T[], T]) {
	return [...head, tail];
}

export function ignore(_: unknown) {
	return undefined;
}

export function id<T>(d: readonly [T, ...any[]]): T {
	return d[0];
}

export function withName<T>(d: T, _a: unknown, _b: unknown, name: string) {
	const array = d as T & {name?: string};
	if (name) array.name = name;
	return array;
}
