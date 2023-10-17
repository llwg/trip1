#!/usr/bin/env -S deno run --allow-run --allow-read

const img_counts = JSON.parse(await Deno.readTextFile('img_counts.json'))

// may or might not actually work
const run = async cmd => {
	const p = Deno.run({ cmd, stdout: 'piped' })

	// read from stdout
	const output = await p.output()
	await p.close()

	return new TextDecoder().decode(output)
}

// note: code cannot have spaces otherwise explodes
const hehe = async code => {
	const toced = await run(`pandoc --to markdown -s --toc --wrap=preserve ${code}.md`.split(/\s+/))

	let zz = []
	let flag = false
	for (const line of toced.split('\n')) {
		const m = line.match(/ *- +(.+)/)
		if (m) {
			zz.push(m[0]
				.replaceAll('    ', '\t')
				.replaceAll('-   ', '- ')
				.replace(/\[(.+)\]\((.+)\).+/g, (_, one, two) => {
					const id = two.slice(1)
					return img_counts[id]
						? `[${one}](${code}.html${two}) (${img_counts[id]} photo)`
						: `[${one}](${code}.html${two})`
				})
			)
			flag = true
		} else {
			if (flag) break
		}
	}

	return zz.join('\n')
}

console.log((await Promise.all(['pre-trip', 'japan', 'taiwan', 'korea', 'conclusions', 'return-trip'].map(hehe))).join('\n'))
