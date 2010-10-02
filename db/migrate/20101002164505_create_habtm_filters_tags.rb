class CreateHabtmFiltersTags < ActiveRecord::Migration
  def self.up
    create_table :filters_tags, :id => false do |t|
      t.integer :filter_id
      t.integer :tag_id
    end
  end

  def self.down
    drop_table :filters_tags
  end
end
