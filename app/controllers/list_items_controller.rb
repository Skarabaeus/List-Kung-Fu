class ListItemsController < ApplicationController

  respond_to :js, :json
  
  def index
    @list_items = ListItem.order('created_at desc')
    respond_with(@list_items)
  end

  def show
    @list_item = ListItem.find(params[:id])
    respond_with(@list_item)
  end

  def new
    @list_item = ListItem.new

    respond_with( @list_item ) do |format|
      format.js
    end
  end

  def edit
    @list_item = ListItem.find(params[:id])

    respond_with( @list_item ) do |format|
      format.js
    end
  end

  def create
    @list_item = ListItem.new(params[:list])

    if @list_item.save
      flash[:notice] = 'List Item has been created.'
    end
    
    respond_with( @list_item )
  end

  def update
    @list_item = ListItem.find(params[:id])
    if @list_item.update_attributes(params[:list])
      flash[:notice] = 'List Item has been updated.'
    end
    
    respond_with( @list_item )
  end

  def destroy
    @list_item = ListItem.find( params[:id] )
    @list_item.destroy
    
    respond_with( @list_item )
  end
end
