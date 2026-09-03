export const shorthands = undefined;

export const up = (pgm) => {
    pgm.sql(`
        INSERT INTO products (
            category_id,
            name,
            brand,
            description,
            price,
            stock_quantity,
            image_url
        )
        VALUES

        -- Electric Guitars
        (
            1,
            'Fender Stratocaster',
            'Fender',
            'A classic electric guitar with a versatile design, suitable for a wide range of playing styles.',
            850000.00,
            10,
            'https://res.cloudinary.com/dx3rxok20/image/upload/v1788430100/Fender_Stratocaster_004-2_nxjosd.jpg'
        ),
        (
            1,
            'Gibson Custom 50th Anniversary 1960 Les Paul Custom',
            'Gibson',
            'A premium Les Paul Custom featuring a classic single-cutaway electric guitar design.',
            1250000.00,
            5,
            'https://res.cloudinary.com/dx3rxok20/image/upload/v1788430102/Gibson_Custom_50th_Anniversary_1960_Les_Paul_Custom__clip_j6gmjv.jpg'
        ),
        (
            1,
            'Aria Pro II Urchin Deluxe V',
            'Aria Pro II',
            'A distinctive V-shaped electric guitar with an eye-catching design for players who want something different.',
            450000.00,
            7,
            'https://res.cloudinary.com/dx3rxok20/image/upload/v1788430101/Aria_Pro_II_Urchin_Deluxe_V__c.1982___2017-11_by_Alexander_Lesnitsky_tb3ied.jpg'
        ),

        -- Acoustic Guitars
        (
            2,
            'Stagg Acoustic Guitar',
            'Stagg',
            'A traditional acoustic guitar designed for comfortable everyday playing and practice.',
            180000.00,
            8,
            'https://res.cloudinary.com/dx3rxok20/image/upload/v1788430159/Stagg_Acoustic_Guitar_mzxsl9.jpg'
        ),
        (
            2,
            'Acoustic-Electric Guitar',
            'Unbranded',
            'An acoustic-electric guitar combining an acoustic body with electronics for amplified performance.',
            220000.00,
            6,
            'https://res.cloudinary.com/dx3rxok20/image/upload/v1788430157/Acoustic-Electric_Guitar_MET_DP-12319-022_nccoqb.jpg'
        ),
        (
            2,
            'Gibson L-1 (1928)',
            'Gibson',
            'A historic-style acoustic guitar representing the classic Gibson L-1 design from the late 1920s.',
            1800000.00,
            2,
            'https://res.cloudinary.com/dx3rxok20/image/upload/v1788430154/Gibson_l-1_1928_jgcjap.jpg'
        ),

        -- Bass Guitars
        (
            3,
            'Triple-Cutaway Bass Guitar',
            'Unbranded',
            'A distinctive electric bass featuring a triple-cutaway body design.',
            700000.00,
            5,
            'https://res.cloudinary.com/dx3rxok20/image/upload/v1788430132/Unknown_triple-cutaway_bass_guitar__2017-11_by_Alexander_Lesnitsky_opljen.jpg'
        ),
        (
            3,
            'Ibanez Bass Guitar',
            'Ibanez',
            'An Ibanez electric bass guitar with a practical design for bass players.',
            500000.00,
            7,
            'https://res.cloudinary.com/dx3rxok20/image/upload/v1788430132/Ibanez_unidentified_bass__2017-11_by_Alexander_Lesnitsky_ffbdrg.jpg'
        ),
        (
            3,
            'LTD F-5E NG',
            'LTD',
            'A five-string electric bass with an extended range for players looking for additional low-end notes.',
            950000.00,
            4,
            'https://res.cloudinary.com/dx3rxok20/image/upload/v1788430131/LTD_F-5E_NG_n2gcnf.jpg'
        ),

        -- Accessories
        (
            4,
            'Guitar Plectrums',
            'Unbranded',
            'A selection of guitar picks for strumming and picking.',
            8000.00,
            30,
            'https://res.cloudinary.com/dx3rxok20/image/upload/v1788430203/shan-lu-0qoZlE76yM4-unsplash_go1d9y.jpg'
        ),
        (
            4,
            'Guitar Strap',
            'Unbranded',
            'An adjustable guitar strap designed to provide comfortable support while playing.',
            25000.00,
            15,
            'https://res.cloudinary.com/dx3rxok20/image/upload/v1788430198/rombo-mQ77CFfR1zE-unsplash_hq6gsx.jpg'
        ),
        (
            4,
            'Guitar Strings',
            'Unbranded',
            'Replacement guitar strings suitable for keeping an instrument ready for regular playing.',
            12000.00,
            25,
            'https://res.cloudinary.com/dx3rxok20/image/upload/v1788430195/rombo-OujU8QemtQM-unsplash_nolubs.jpg'
        ),

        -- Amplifiers
        (
            5,
            'Rocktron Rampage R120DSP',
            'Rocktron',
            'A guitar amplifier designed to provide amplified guitar sound for practice and performance.',
            180000.00,
            5,
            'https://res.cloudinary.com/dx3rxok20/image/upload/v1788430282/Rocktron_Rampage_R120DSP_djbspy.jpg'
        ),
        (
            5,
            'Guitar Amplifier',
            'Unbranded',
            'A general-purpose guitar amplifier for producing amplified electric guitar sound.',
            250000.00,
            6,
            'https://res.cloudinary.com/dx3rxok20/image/upload/v1788430235/Amplifier3_mnmxzq.jpg'
        ),
        (
            5,
            'Matchless HC-30',
            'Matchless',
            'A guitar amplifier from Matchless with a classic amplifier design.',
            420000.00,
            3,
            'https://res.cloudinary.com/dx3rxok20/image/upload/v1788430233/Matchless_hc-30_l9umwr.jpg'
        );
    `);
};

export const down = (pgm) => {
    pgm.sql(`
        DELETE FROM products
        WHERE name IN (
            'Fender Stratocaster',
            'Gibson Custom 50th Anniversary 1960 Les Paul Custom',
            'Aria Pro II Urchin Deluxe V',
            'Stagg Acoustic Guitar',
            'Acoustic-Electric Guitar',
            'Gibson L-1 (1928)',
            'Triple-Cutaway Bass Guitar',
            'Ibanez Bass Guitar',
            'LTD F-5E NG',
            'Guitar Plectrums',
            'Guitar Strap',
            'Guitar Strings',
            'Rocktron Rampage R120DSP',
            'Guitar Amplifier',
            'Matchless HC-30'
        );
    `);
};