node --env-file=.env.local migration/import-news.mjs

node --env-file=.env.local migration/delete-draft.mjs

node --env-file=.env.local migration/import-page.mjs

Create a script that works just like migration/import.mjs but this script is used for migrating general pages form the wordpress site. Ask the user to provide a page to migrate as a parameter but no need to ask what section to tag the page to be migrated with. The pages can be migrated to the Pages Structure in sanity studio. 
Rename import.mjs to be import-news.mjs and this script can be called import-page.mjs


Beavers — #E8640A (orange)
Cubs — #2A5298 (mid blue)
Scouts — #1A3A6B (dark blue)
Ventures — #0D2044 (very dark navy)
Rovers — #6B4E71 (plum)


Section	Hex
Group Council	#5A6A8A
Beavers	#E8640A
Cubs	#2A5298
Scouts	#1A3A6B
Ventures	#0D2044
Rovers	#6B4E71
