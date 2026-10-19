-- Sättel (saddles)
INSERT INTO saddles (name) VALUES
                               ('Speedline'),
                               ('Raceline'),
                               ('Fizik Tundra'),
                               ('Spark');

-- Rahmen (frames)
INSERT INTO frames (name) VALUES
                              ('Aluminium 7005DB'),
                              ('Carbon Monocoque'),
                              ('Aluminium 7005TB');

-- Gabeln (forks)
INSERT INTO forks (name) VALUES
                             ('Fox 32 F100'),
                             ('Fox Talas 140'),
                             ('Rock Schox Recon 351'),
                             ('Rock Schox Reba'),
                             ('Fox 32 F80'),
                             ('Rock Schox Recon SL'),
                             ('SR Suntour Raidon');

-- Bike-Modelle (Optimierte Version ohne UNION ALL)
INSERT INTO bike_models (name, saddle_id, frame_id, fork_id)
VALUES
    ('MTB Allrounder',
     (SELECT id FROM saddles WHERE name = 'Speedline'),
     (SELECT id FROM frames WHERE name = 'Aluminium 7005DB'),
     (SELECT id FROM forks WHERE name = 'Fox 32 F100')),
    ('MTB Competition',
     (SELECT id FROM saddles WHERE name = 'Raceline'),
     (SELECT id FROM frames WHERE name = 'Carbon Monocoque'),
     (SELECT id FROM forks WHERE name = 'Fox Talas 140')),
    ('MTB Downhill',
     (SELECT id FROM saddles WHERE name = 'Fizik Tundra'),
     (SELECT id FROM frames WHERE name = 'Aluminium 7005TB'),
     (SELECT id FROM forks WHERE name = 'Rock Schox Recon 351')),
    ('MTB Extreme',
     (SELECT id FROM saddles WHERE name = 'Spark'),
     (SELECT id FROM frames WHERE name = 'Carbon Monocoque'),
     (SELECT id FROM forks WHERE name = 'Rock Schox Reba')),
    ('MTB Freeride',
     (SELECT id FROM saddles WHERE name = 'Fizik Tundra'),
     (SELECT id FROM frames WHERE name = 'Aluminium 7005TB'),
     (SELECT id FROM forks WHERE name = 'Fox 32 F80')),
    ('MTB Marathon',
     (SELECT id FROM saddles WHERE name = 'Raceline'),
     (SELECT id FROM frames WHERE name = 'Aluminium 7005DB'),
     (SELECT id FROM forks WHERE name = 'Rock Schox Recon SL')),
    ('MTB Performance',
     (SELECT id FROM saddles WHERE name = 'Fizik Tundra'),
     (SELECT id FROM frames WHERE name = 'Aluminium 7005TB'),
     (SELECT id FROM forks WHERE name = 'Rock Schox Reba')),
    ('MTB Trail',
     (SELECT id FROM saddles WHERE name = 'Speedline'),
     (SELECT id FROM frames WHERE name = 'Carbon Monocoque'),
     (SELECT id FROM forks WHERE name = 'SR Suntour Raidon'));