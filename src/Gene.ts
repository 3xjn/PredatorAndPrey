// each gene will have 6 points to spend into different traits
// mutation will be done by adding or removing a point from a trait
// must keep the number of points in each trait constant

class Trait {
    public max: number;
    public value: number;

    constructor(max: number, value: number) {
        this.max = max;
        this.value = value;
    }
}

// each trait below is a trait that the gene can have
/*
deathProbability
predatorDeathThreshold
reproduceThreshold
maxHealth
maxAge
twinLikelyhood
*/

interface GeneValues {
    survivalProbability: number;
    predatorDeathThreshold: number;
    reproduceThreshold: number;
    maxHealth: number;
    maxAge: number;
    twinLikelyhood: number;
    pointFunds: number; // the total number of points that can be spent into each trait
}

class Gene {
    initialValue: GeneValues;
    survivalProbability: Trait;
    predatorDeathThreshold: Trait;
    reproduceThreshold: Trait;
    maxHealth: Trait;
    maxAge: Trait;
    twinLikelyhood: Trait;
    pointFunds: number; // the total number of points that can be spent into each trait

    constructor(initialValue?: GeneValues) {
        this.initialValue = initialValue;
        this.pointFunds = initialValue?.pointFunds ?? 0;
        this.survivalProbability = new Trait(1, initialValue?.survivalProbability ?? 1);
        this.predatorDeathThreshold = new Trait(1, initialValue?.predatorDeathThreshold ?? 0);
        this.reproduceThreshold = new Trait(1, initialValue?.reproduceThreshold ?? 0.5);
        this.maxHealth = new Trait(1, initialValue?.maxHealth ?? 4);
        this.maxAge = new Trait(1, initialValue?.maxAge ?? 4);
        this.twinLikelyhood = new Trait(1, initialValue?.twinLikelyhood ?? 0.5);
    }

    public mutate(): Gene {
        // for each trait value changed, the others will be adjusted accordingly
        // mutation will be done by adding or removing a point from a trait
        // must keep the total number of points constant
        // pick one trait to mutate
        
        let traits = [ this.survivalProbability, this.predatorDeathThreshold, this.reproduceThreshold, this.maxHealth, this.maxAge, this.twinLikelyhood ];
        let randomNumber = Math.floor(Math.random() * 6);

        let traitToMutate: Trait = traits[randomNumber];

        // if the trait is at max, remove a point
        if (traitToMutate.value === traitToMutate.max) {
            traitToMutate.value--;
            this.pointFunds++;
        }

        // if the trait is at min, add a point
        else if (traitToMutate.value === 0) {
            traitToMutate.value++;
            this.pointFunds--;
        }

        // if the trait is at the middle, add or remove a point
        else {
            switch (Math.floor(Math.random() * 2)) {
                case 0: {
                    traitToMutate.value++;
                    this.pointFunds--;
                    break;
                }

                case 1: {
                    traitToMutate.value--;
                    this.pointFunds++;
                    break;
                }
            }
        }

        return this;
    }

    public clone(): Gene {
        return new Gene(this.initialValue);
    }
}

export { Gene, Trait };