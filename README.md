# Simulátor šíření onemocnění

Jednoduchý [simulátor](https://maly.github.io/korona-simulator/sim.html) ukazuje šíření nemoci v populaci. Pro inspiraci posloužil článek [Why outbreaks like coronavirus
spread exponentially, and how to “flatten the curve”](https://www.washingtonpost.com/graphics/2020/world/corona-simulator/).

V [simulaci](https://maly.github.io/korona-simulator/sim.html) je volitelný počet jedinců (100 - 500), kteří se volně pohybují po ploše a potkávají se s dalšími jedinci. Na počátku simulace je jeden z nich nakažený.

Nákaza u jednotlivce probíhá tak, že deset dní je nakažený bezpříznakový, ale šíří nákazu. Po deseti dnech se z něj stane nemocný. Nemocný se nehýbe, a zároveň s časem klesá jeho schopnost nakazit ostatní. Po deseti dnech se nemocný uzdraví, nebo zemře.

Uzdravení jedinci se opět mohou pohybovat - ale mohou se také opakovaně nakazit, i když pravděpodobnost je mnohem menší. Při opakované nákaze je rychlost nemoci vyšší, ale také je vyšší riziko úmrtí.

Simulace končí, když je počet nakažených a nemocných roven 0.

Některé parametry simulace lze měnit:

- Počet jedinců v populaci
- Pravděpodobnost, s jakou se zdravý nakazí
- Pravděpodobnost, s jakou se znovu nakazí už uzdravený
- Pravděpodobnost úmrtí při první nákaze

### Zákaz vycházení

Simulace obsahuje také "karanténu", respektive zákaz pohybu. Můžete si nastavit, kdy bude zákaz aplikován (např. když bude 10 % populace nemocných), kdy bude zákaz odvolán (např. pokud počet nemocných klesne pod 5 %) a jak silný zákaz je.

Síla zákazu je na stupnici od 0 (žádný zákaz) až po 7 (sedm lidí z osmi se nebude hýbat). I při nejpřísnějším zákazu se tedy osmina lidí pohybuje.

## Upozornění!

**Uvedená simulace je jen matematický model!** Prosím, **nezakládejte** na jejích výsledcích žádná svá rozhodnutí v reálném životě. Chovejte se zodpovědně!