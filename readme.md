to use this folder in your project:

1. import it using a sync task, under sub folder /sync_modules
2. ignore it in your git-ignore
3. might need to add this in your tsconfig include for types.d.ts files to work
```
"src/**/types/**/*"
```
4. the parent folder must export in the _dependencies file:
   1. IsLocalDev bool
   1. BuildNumber string
   1. ReleaseStatus string (fast ring, production, local dev etc)

